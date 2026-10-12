// rapportly.no/fra/<kilde> → teller besøket og sender videre til forsiden.
// Merkede lenker: rapport-e-posten og invitasjonen fra appen, signaturen og
// oppføringene hos regnskapssystemene. utm_source følger med til forsiden, så
// Google Analytics ser kilden hos dem som har samtykket.
const { erMenneske, tell, lesKilde } = require('./_teller.js');

module.exports = async (req, res) => {
  const kilde = lesKilde(req.query.kilde);
  if (erMenneske(req)) await tell('besok', kilde);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.redirect(302, kilde === 'annet' ? '/' : `/?utm_source=${kilde}`);
};
