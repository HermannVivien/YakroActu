/**
 * Générer un slug à partir d'un texte
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

/**
 * Formater une date
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculer le temps de lecture d'un article
 */
const calculateReadTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

/**
 * Tronquer un texte
 */
const truncate = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Générer un code aléatoire
 */
const generateCode = (length = 6) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  generateSlug,
  formatDate,
  calculateReadTime,
  truncate,
  generateCode
};
