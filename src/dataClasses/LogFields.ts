export class LogFields{
    static Fields() {
        return {
            Hash:"Hash",
            Abbrev_Hash:"Abbrev_Hash",
            Parent_Hashes:"Parent_Hashes",
            Author_Name:"Author_Name",
            Author_Email:"Author_Email",
            Date:"Date",
            Ref:"Ref",
            Message:"Message",
            Body:"Body",
        }
    }

    static FieldCount(){
        return Object.keys(LogFields.Fields).length;
    }
}