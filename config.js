// plant-picker on row-picker: the plant-specific settings. Every option and its default:
// https://github.com/ChaotX/row-picker/blob/v1.1.0/js/settings.js
//
// storagePrefix and linksTitle keep their plant-picker values, so sign-in, recent sheets and saved short links
// carry over. The Google values are public (they end up in the browser anyway); they are restricted to the
// chaotx.github.io origin.
export default {
    name: 'plant-picker',
    icon: 'favicon.svg',
    storagePrefix: 'plant-picker',
    linksTitle: 'plant-picker links',
    locale: 'hu',
    languages: ['hu', 'en'],
    // The 12 month columns (● = flowers then) as one virtual "Virágzik" column: one filter, a month strip in the
    // list, sorting by when flowering starts or ends.
    columnGroups: [
        { name: 'Virágzik', columns: ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'], sequence: 'cyclic' }
    ],
    strings: {
        hu: {
            startTitle: 'Növények válogatása Google-táblázatból',
            startIntro: 'Válassz növénytáblázatot, adj hozzá szűrőket és rendezést, és mentsd el az eredményt linkként. A link mindig a táblázat aktuális tartalmán fut.'
        },
        en: {
            startTitle: 'Pick plants from a Google Sheet',
            startIntro: 'Choose a plant spreadsheet, add filters and a sort order, and keep the result as a link. The link always runs on the sheet’s current content.'
        }
    },
    google: {
        clientId: '136817057087-26jlqfkmptubg04r16eph1pl630u10nd.apps.googleusercontent.com',
        apiKey: 'AIzaSyACuO7wMIbS_PCNqZm6Vqm5LYAKT-TNips',   // Drive Picker, and reading link-shared sheets without sign-in
        appId: '136817057087'                                 // Cloud project number, for the Drive Picker
    }
};
