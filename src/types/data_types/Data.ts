export module Data {
    export interface UserSave extends Object {
        _id: number
        [x: string]: any
    }

    export interface TimeSave extends Object {
        last_initiliazed: string
        last_ran_functions: { [key: string]: string; }
        [x: string]: any
    }
}
