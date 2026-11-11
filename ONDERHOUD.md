# Onderhoud Eva's sportplan: regels bij elke update

Eva's gegevens (vinkjes, logs, records, check-in, beoordelingen) staan in `localStorage` op haar telefoon. Een update vervangt alleen `index.html`. Deze regels zorgen dat haar gegevens blijven werken.

## Nooit doen
- De opslagsleutel `eva-app-v2` hernoemen of leegmaken.
- Een bestaande oefeningcode (A1–A7, B1–B7, C1–C9) hernoemen, verwijderen of hergebruiken voor een andere oefening. Een nieuwe oefening krijgt een nieuwe code (bv. A8).
- Check-invragen van een week aanpassen die al begonnen is. Alleen toekomstige weken aanpassen.
- Bestaande velden in de opgeslagen data (`days`, `habits`, `logs`, `rate`, `ci`, `food`, `runs`, `flags`, `mset`, `shop`, `wu`, `opened`, `newpr`, `fuel`, `onboarded`, `first`, `whenHide`, `daily`) hernoemen of van vorm veranderen.

## Veilig
- Dagen binnen een week verschuiven: vinkjes hangen aan de datum.
- Nieuwe velden toevoegen, met een standaardwaarde als ze ontbreken.
- Nieuwe week vrijgeven: `PUBLISHED` ophogen, `WEEKS[n]` invullen, persoonlijke zin in `MSG[n]`.
- Bij een nieuwe versie het cachenummer in `sw.js` ophogen.

## Controle voor elke push
1. Laad de nieuwe versie met een opgeslagen staat van de vorige versie en controleer dat vinkjes, logboek, records en check-in-antwoorden nog zichtbaar zijn.
2. Syntaxcheck van het script.
3. Telefoon-screenshot van Week, Training, Eten en Gids.
