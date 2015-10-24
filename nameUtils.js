module.exports = {
    parse(name){
        if (this.isScoped(name)){
            return name.replace('/', '%2f');
        }

        return name;
    },

    isScoped(name){
        return name.startsWith('@');
    }
};