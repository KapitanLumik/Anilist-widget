import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ANILIST_USERNAME = "KapitanLumik"; // Zde si případně změníš jméno

const query = `
query ($name: String) {
  User (name: $name) {
    name
    about
    stats {
      watchedTime
      chaptersRead
      animeListOptions { rowOrder }
    }
    statistics {
      anime {
        count
        episodesWatched
      }
      manga {
        count
        chaptersRead
      }
    }
  }
}
`;

serve(async (req) => {
  try {
    // 1. Zeptáme se AniList API na data
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ query, variables: { name: ANILIST_USERNAME } }),
    });

    const data = await response.json();
    const user = data.data.User;

    // 2. Přetransformujeme data do formátu pro tvůj Discord Widget
    const widgetData = {
      title: "Anilist",
      username: user.name,
      subtitle: "Larping is the way of life",
      stats: [
        { label: "Total Anime", value: user.statistics.anime.count.toString() },
        { label: "Episodes Watched", value: user.statistics.anime.episodesWatched.toLocaleString() },
        { label: "Total Manga", value: user.statistics.manga.count.toString() },
        { label: "Chapters Read", value: user.statistics.manga.chaptersRead.toLocaleString() }
      ]
    };

    // 3. Pošleme to jako čisté JSON
    return new Response(JSON.stringify(widgetData), {
      headers: { 
        "content-type": "application/json; charset=UTF-8",
        "access-control-allow-origin": "*" 
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});