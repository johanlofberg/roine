// No standard module for purely alphabetic identifier?

export default function readableRandomStringMaker(length = 32) {
    for (var s = ''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.random() * 62 | 0));
    return s;
}