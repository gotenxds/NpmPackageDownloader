export default {
    parse(name){
        if (this.isScoped(name)){
            return name.replace('/', '%2f');
        }

        return name;
    },

    isScoped(name){
        return name.startsWith('@');
    },

    unscopeName(scopedName){
        if (this.isScoped(scopedName)){
            return scopedName.split('%2f')[1]
        }

        return scopedName;
    }
};