import Command from "./Command";

import addCommand from "./add";
import purgeCommand from "./purge";
import retrieveCommand from "./retrieve";
import helpCommand from "./help";

import { Message } from "discord.js";

export default class CommandHandler{
    private commands: Command[];

    constructor(){
        this.commands = [
            addCommand,
            purgeCommand,
            retrieveCommand,
            helpCommand
        ]        
    }

    public getCommands(){
        return this.commands;
    }

    public matchCommand(message: Message){
        for(const command of this.commands){
            const matcherFn = command.getMatcher();
            if(matcherFn(message)){
                return command
            }
        }
        return null;
    }

}