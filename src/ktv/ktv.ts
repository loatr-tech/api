import { Express, Request } from 'express';
import cheerio from 'cheerio';
import axios from 'axios';

export default function ktvApi(app: Express) {
  app.get('/ktv/search', async (req: Request, res) => {
    const { query } = req.query;
    console.log(query);
    axios.get(`https://youtube.com/results`, {
      params: {
        search_query: `${query} karaoke 伴奏 ktv`
      }
    }).then(({ data }) => {
      // Scrape Youtube seach results
      const $html = cheerio.load(data, { decodeEntities: false });
      let searchResultsData: any = {};
      $html('body script').each((_, script) => {
        const scriptContent = $html(script).html();
        if (scriptContent?.includes('var ytInitialData = ')) {
          searchResultsData = JSON.parse(scriptContent.replace('var ytInitialData = ', '').slice(0, -1));
          return;
        }
      });

      // Filtering on useful data
      const videoContents = searchResultsData
        .contents
        .twoColumnSearchResultsRenderer
        .primaryContents
        .sectionListRenderer
        .contents[0]
        .itemSectionRenderer
        .contents;
      
      // Re-format and return essential payload
      const qualifyVideos: any[] = [];
      videoContents.forEach((videoContent: any) => {
        const content = videoContent.videoRenderer;
        if (content && qualifyVideos.length < 5) {
          qualifyVideos.push({
            videoId: content.videoId,
            thumbnail: content.thumbnail,
            title: content.title,
          })
        }
      })

      // Send the response
      res.send(JSON.stringify(qualifyVideos));
    }).catch(err => {
      console.error(err);
    })
  });
}