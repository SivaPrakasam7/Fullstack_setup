export const emailRegex = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
export const passwordRegex =
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$';
export const fullNameRegex = '^(?=.{2,30}$)[a-zA-Z]+(?:[\\s-][a-zA-Z]+)*$';
export const phoneNumberRegex =
    '^\\+?[1-9]\\d{0,2}[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}$';
export const phoneNumberRegexWithCountryCode =
    '^\\+[1-9]\\d{0,2}[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}$';
