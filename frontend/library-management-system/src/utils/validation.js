export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateISBN = (isbn) => {
  const cleaned = isbn.replace(/[-\s]/g, '');
  return cleaned.length === 10 || cleaned.length === 13;
};

export const validatePhone = (phone) => {
  const re = /^[\d\s\-\(\)]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
};
