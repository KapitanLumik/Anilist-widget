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

async function handleRequest(req) {
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

    if (data.errors || !data.data || !data.data.User) {
      return new Response(JSON.stringify({ 
        error: "Uzivatel nenalezen nebo AniList API ma vypadek" 
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
}

// TATO ČÁST JE KLÍČOVÁ PRO KOYEB: Čte port z prostředí
const port = parseInt(Deno.env.get("PORT") || "8000");
Deno.serve({ port, handler: handleRequest });
