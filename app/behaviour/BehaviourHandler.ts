import banEveryone from "./banEveryone";
import { Message } from "discord.js";
import Behaviour from "./Behaviour";
import DiscordManager from "../DiscordManager";
import StateObject from "../state/StateObject";

export default class BehaviourHandler{
    private behaviours: Behaviour[];

    constructor(){
        this.behaviours = [
            banEveryone
        ]        
    }

    public executeBehaviour(manager: DiscordManager, message: Message): boolean{
        for(const behaviour of this.behaviours){
            const matcherFn = behaviour.getMatcher();
            if(matcherFn(message)){
                const type = behaviour.getType();
                if(message.channel.type === type){
                    const handlerFn = behaviour.getHandler();
                    handlerFn(manager, message);
                    return true;
                }
                return false;
            }
        }
        return false;
    }
}