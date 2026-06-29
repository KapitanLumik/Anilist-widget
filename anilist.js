import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ANILIST_USERNAME = "KapitanLumik";

const query = `
query ($name: String) {
  User (name: $name) {
    name
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
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json" 
      },
      body: JSON.stringify({ query, variables: { name: ANILIST_USERNAME } }),
    });

    const data = await response.json();

    // Ošetření situace, kdy AniList vrátí chybu (např. uživatel neexistuje)
    if (data.errors || !data.data || !data.data.User) {
      return new Response(JSON.stringify({ 
        error: "Uzivatel nenalezen nebo AniList API ma vypadek", 
        detail: data.errors || "Data jsou prazdna" 
      }), {
        status: 404,
        headers: { 
          "content-type": "application/json; charset=UTF-8",
          "access-control-allow-origin": "*" 
        },
      });
    }

    const user = data.data.User;

    const widgetData = {
      title: "Anilist",
      username: user.name,
      subtitle: "Larping is the way of life",
      stats: [
        { label: "Total Anime", value: String(user.statistics.anime.count) },
        { label: "Episodes Watched", value: String(user.statistics.anime.episodesWatched) },
        { label: "Total Manga", value: String(user.statistics.manga.count) },
        { label: "Chapters Read", value: String(user.statistics.manga.chaptersRead) }
      ]
    };

    return new Response(JSON.stringify(widgetData), {
      headers: { 
        "content-type": "application/json; charset=UTF-8",
        "access-control-allow-origin": "*" 
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Serverova chyba", message: err.message }), { 
      status: 500,
      headers: { 
        "content-type": "application/json; charset=UTF-8",
        "access-control-allow-origin": "*" 
      },
    });
  }
});
