import { PossibleStates } from "./StateManager";
import { HandlerType } from "../commands/Command";
import { clearTimeout } from "timers";
import { User } from "discord.js";

export default class StateObject{
    private readonly stateType: PossibleStates;
    private readonly user: User;
    private readonly nextHandler?: HandlerType;
    private readonly timeoutId?: NodeJS.Timeout;
    private currentState: any;
    
    constructor(user: User, stateType: PossibleStates, timeoutId?: NodeJS.Timeout, nextHandler?: HandlerType){
        this.user = user;
        this.stateType = stateType;
        this.nextHandler = nextHandler;
        this.timeoutId = timeoutId;
        this.currentState = {};
    }
    public sendMessageToUser(content: string) {
        this.user.dmChannel.send(content);
    }

    public getStateType(){
        return this.stateType;
    }

    public getNextHandler(){
        return this.nextHandler;
    }

    public cancelTimeout(){
        if(this.timeoutId){
            clearTimeout(this.timeoutId);
        }        
 
    }

    public getState(): Readonly<any> {
        return this.currentState;
    }

    public updateState(newState: any){
        this.currentState = newState;
    }
}