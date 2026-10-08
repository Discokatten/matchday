# Matchday frontend

En Next.js-applikation för att se matcher i Allsvenskan och hålla konversationer kring dem. Startsidan hämtar matcher från backendens API.
Inloggning och registrering skickas via Next-route-handlers så att backendens access-token kan lagras i en HttpOnly-cookie i stället för i `localStorage`.

## Starta lokalt

Kör från den här katalogen (`frontend/`):

```bash
npm ci
npm run dev
```

Öppna `http://localhost:3000`. Frontendens server anropar backend via `API_URL`, som är standard `http://localhost:8080`.

I PowerShell:

```powershell
$env:API_URL = "http://localhost:8080"
npm run dev
```

Hela utvecklingsstacken kan i stället startas från projektroten med `docker compose up --build`.

## Förväntat auth-API-kontrakt

Backend behöver implementera följande JSON-endpoints:

| Metod  | Endpoint                | Request                                 | Förväntat svar                  |
| ------ | ----------------------- | --------------------------------------- | ------------------------------- |
| `POST` | `/api/v1/auth/register` | `{ "email": "...", "password": "..." }` | 2xx vid skapad användare        |
| `POST` | `/api/v1/auth/login`    | `{ "email": "...", "password": "..." }` | `{ "token": "<bearer-token>" }` |

Felsvar kan innehålla `{ "message": "..." }`. Frontend skickar inte
`confirmPassword` till backend. Backendens token ska vara ett Bearer-token som backend själv validerar och bör upphöra att gälla inom 24 timmar.

Vid `npm run dev` använder inloggningen backendens lokala Basic Auth. Ange samma användarnamn och
lösenord som `MATCHDAY_LOCAL_USERNAME` och `MATCHDAY_LOCAL_PASSWORD` på backend, exempelvis
`local-operator` och `local-dev-password` från Compose. Next lagrar de tillfälliga
utvecklingsuppgifterna i en HttpOnly-cookie och skickar Basic Auth endast server-till-server via
API-proxyn. Den här utvecklingsvägen är avstängd utanför development. Registreringsformuläret är
fortfarande en mock och skapar ingen backend-användare.

Efter lyckad inloggning lagrar frontend token i en `HttpOnly`, `SameSite=Strict`-cookie. Next skyddar navigering till `/dashboard` och `/conversation/...` genom att kontrollera att cookien finns.
Skyddade API-anrop skickas via `/api/backend/...`; Next läser cookien på serversidan och vidarebefordrar token som `Authorization: Bearer ...` till motsvarande `/api/v1/...`-endpoint.
Om backend svarar med `401` tas cookien bort och klienten skickas till inloggningen. Backend måste fortfarande validera token och neka obehöriga anrop.

Route-guardens cookie-kontroll är endast navigeringsskydd, inte en säkerhetsgräns. Backendens
lokala Basic Auth-användare autentiseras, men circle-endpoints kräver dessutom att backend kan
översätta den inloggade användaren till en applikationsidentitet. Om backend svarar med
`urn:matchday:problem:authentication-required` saknas den kopplingen; frontend behåller då
inloggningen men kan inte slutföra circle-anropet.

`API_URL` ska vara nåbar från Next-servern. Använd exempelvis `http://localhost:8080` vid lokal körning och `http://backend:8080` från frontend-containern i Docker Compose.

## Circle API

Matchkort länkar till `/conversation/{matchId}`. Samtalsvyn använder backendens match-circle
endpoints genom den skyddade frontend-proxyn:

| Metod | Endpoint | Frontend-funktion |
| --- | --- | --- |
| `GET` | `/api/v1/matches/{matchId}/circle` | Hämta circle och aktuell medlemsstatus |
| `POST` | `/api/v1/matches/{matchId}/circle` | Skapa circle och bli första medlem |
| `PUT` | `/api/v1/matches/{matchId}/circle/membership` | Gå med |
| `DELETE` | `/api/v1/matches/{matchId}/circle/membership` | Lämna |

Ett `404` från GET betyder att matchen saknar en circle; samtalsvyn erbjuder då att skapa en.
Svaret innehåller circle-ID, match-ID, skapandetid och `membershipActive`. Backendens circle-API
hanterar inte meddelanden, så meddelandeutbyte ingår inte i den här kopplingen.

## Kvalitetskontroller

```bash
npm test
npm run lint
npm run build
```
