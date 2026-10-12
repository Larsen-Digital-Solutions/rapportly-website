// rapportly.no/eksempel?kilde=epost → teller åpningen og sender videre til eksempelrapporten.
// Lenken i cold e-posten og på nettsiden går hit, fordi Vercel ikke teller en PDF.
const { erMenneske, tell, lesKilde } = require('./_teller.js');

module.exports = async (req, res) => {
  if (erMenneske(req)) await tell('eksempelrapport', lesKilde(req.query.kilde));
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.redirect(302, '/eksempelrapport.pdf');
};
