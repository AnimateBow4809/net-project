export class Message {
    public sender:String;
    public reciver:String;

    public time:Date;
    public messageData:String;

    /**
     *
     */
    constructor(reciver:String,sender:String,time:Date,data:String) {
        this.sender=sender;
        this.time=time;
        this.messageData=data;
        this.reciver=reciver;
    }

}
