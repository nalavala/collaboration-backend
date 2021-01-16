const base64Encoding = (number) => {

    const char_set = "abcdefghijklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ0123456789+-/*";
    let hash = "";
    while(number > 0) {
        hash = hash + char_set.charAt(number % 64);
        number = Math.trunc(number / 64);
    }

    return hash;
};

console.log(base64Encoding(Math.random() * ( 9999999999999999 - 1) + 1));