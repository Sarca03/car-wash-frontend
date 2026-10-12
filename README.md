# Auto perionica: frontend

Aplikacija za vlasnika auto perionice: termini, klijenti, vozila, usluge i radnici na jednom mestu.

**Uživo:** https://car-wash-bogdan.netlify.app
Demo: na stranici za prijavu klikni „Pogledaj demo“. Demo nalog može samo da pregleda podatke.

Backend (Node.js, Express, PostgreSQL) je u posebnom repou: [car-wash-backend](https://github.com/Sarca03/car-wash-backend).

## Šta radi

- **Pregled:** današnji termini po satu, sledeći termin, prihod od završenih termina i raspodela po statusu.
- **Termini:** zakazivanje, izmena i promena statusa (na čekanju, potvrđen, završen, otkazan). Pri izboru usluge cena se popunjava sama, a vozila se filtriraju po izabranom klijentu.
- **Klijenti, vozila, usluge, radnici:** dodavanje, izmena, brisanje i pretraga.
- **Prijava** preko JWT tokena. Token se šalje uz svaki zahtev, a kad istekne (401) korisnik se vraća na prijavu.
- Na telefonu je donji meni, a tabela termina se prikazuje kao kartice.

## Tehnologije

React 19, React Router, Vite, Tailwind CSS 4, Axios, lucide-react ikonice, react-hot-toast.

## Pokretanje

```bash
npm install
npm run dev     # http://localhost:5173, /api ide na lokalni backend
npm run build
npm run lint
```

Adresa API-ja je u `VITE_API_URL` (`.env.production`). Ako nije zadata, build gađa backend na Render-u.
