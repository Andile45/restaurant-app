export const formatDate = (date: string) => 
  new Date(date).toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' });
