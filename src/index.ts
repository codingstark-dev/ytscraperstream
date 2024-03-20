import { Hono } from "hono";
// import YouTube from "youtube-sr";
// import { searchManager } from "ytmusic_api_unofficial";
import { cors } from "hono/cors";
import { z } from "zod";
// import SoundCloud from "soundcloud-scraper";


const app = new Hono();

app.use("/", cors());

function youtube_parser(url: string): string | false {
  var regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  if (match && match[2].length == 11) {
    return match[2];
  } else {
    return false;
  }
}

app.all("/", async (c) => {
  const { id } = c.req.query();
 
 
  c.res.headers.append(
    "user-agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
  );
  
  if (!id) {
    return c.redirect("https://codingstark.com/");
  }
  // let video = await YouTube.getVideo(id);
  // console.log(await searchManager.search("song", "MUSIC"));
  // console.log(video);
  //scrape the id from the youtube url
  const url = z.string().parse(id);
  console.log(url);
  let dataofsd = await fetch(
    `https://soundclouddl.netlify.app/api/audio.json?url=${url}`
  );
  console.log(dataofsd);
 let data :any = await dataofsd.json();
console.log(data);
  // if (url.includes("playlist") || url.includes("list")) {
  //   throw new Error("This is a playlist, not a video");
  // }
  // const videoID = youtube_parser(url);

  // const youtubeVideoURL = `https://www.youtube.com/watch?v=${videoID}`;

  // const response = await fetch(youtubeVideoURL, {});
  // const html = await response.text();

  // // find video data object:  ytInitialPlayerResponse = {...};
  // const regex = html.match(`var ytInitialPlayerResponse = (.*);<\/script>`);
  // if (!regex) throw new Error("Unable to find video data");

  // const json = JSON.parse(regex[1]);
  // let audioUrls = [];
  // for (const format of json.streamingData.adaptiveFormats) {
  //   if (format.mimeType && format.mimeType.startsWith("audio/")) {
  //     if (format.signatureCipher) {
  //       audioUrls.push(format.signatureCipher);
  //     } else if (format.url) {
  //       audioUrls.push(format.url);
  //     }
  //   }
  // }
  // let videodata = await fetch(audioUrls[0]);


c.header("Content-Type", "audio/mpeg");

  return c.body( (await fetch(data.fetchStreamURL)).body );
  
  // c.html(
  //   `<audio controls>
  //   <source src="${data.fetchStreamURL}" type="audio/mp3">
  //   Your browser does not support the audio element.
  // </audio>`
  // );
});

app.all("playlist", async (c) => {
  const { id } = c.req.query();
  if (!id) {
    return c.redirect("https://codingstark.com/");
  }
  const url = z.string().parse(id);
  if (!url.includes("playlist") && !url.includes("list")) {
    throw new Error("This is not a playlist");
  }
  const playlistID = youtube_parser(url);
  console.log(playlistID);
  const youtubePlaylistURL = `https://www.youtube.com/playlist?list=${playlistID}`;
  const response = await fetch(url);
  const html = await response.text();
  const regex = html.match(`var ytInitialData = (.*);<\/script>`);
  if (!regex) throw new Error("Unable to find playlist data");
  const json = JSON.parse(regex[1]);
  let videoUrls = [];
  for (const video of json.contents.twoColumnBrowseResultsRenderer.tabs[0]
    .tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer
    .contents[0].playlistVideoListRenderer.contents) {
    videoUrls.push(video.playlistVideoRenderer.videoId);
  }
  
  return c.html(
    `<html>
    <body>
      <audio id="audio" controls>
        <source src="${await audioBasedonid(videoUrls[0])}" type="audio/mp3">
        Your browser does not support the audio element.
      </audio>
      <button onclick="play()">Play</button>
      <button onclick="pause()">Pause</button>
    </body>
    <script>
      function play() {
        var audio = document.getElementById("audio");
        audio.play();
      }
      function pause() {
        var audio = document.getElementById("audio");
        audio.pause();
      }
    </script>
    </html>`
  );
});
async function audioBasedonid(videoID: string) {
  const youtubeVideoURL = `https://www.youtube.com/watch?v=${videoID}`;

  const response = await fetch(youtubeVideoURL, {});
  const html = await response.text();

  // find video data object:  ytInitialPlayerResponse = {...};
  const regex = html.match(`var ytInitialPlayerResponse = (.*);<\/script>`);
  if (!regex) throw new Error("Unable to find video data");

  const json = JSON.parse(regex[1]);
  let audioUrls = [];
  for (const format of json.streamingData.adaptiveFormats) {
    if (format.mimeType && format.mimeType.startsWith("audio/")) {
      if (format.signatureCipher) {
        audioUrls.push(format.signatureCipher);
      } else if (format.url) {
        audioUrls.push(format.url);
      }
    }
  }
  console.log(audioUrls[0]);
  return audioUrls[0];
}

app.onError((err, c) => {
  console.error(`${err}`);
  return c.text(err.toString(), 500);
});

export default app;
