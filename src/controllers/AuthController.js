const authService = require('../services/authServices');

module.exports = {
  async register(req, res) {
    try {
      const { email, nom, prenom, password } = req.body;
      
      // ✅ CORRECTION : Créer un username à partir de nom et prenom
      const username = `${nom}_${prenom}`.toLowerCase().replace(/\s+/g, '_');
      
      const result = await authService.register({ 
        email, 
        username, 
        nom,
        prenom,
        password 
      });
      
      res.status(201).json({ user: result.user, qrCode: result.qrCode });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password, token } = req.body;
      const result = await authService.login({ email, password, token });
      res.status(200).json({ token: result.token });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  },
}; 