import Command, {HandlerType, MatcherFunction} from './Command';
import DiscordManager from '../DiscordManager';
import { Message, MessageEmbed } from 'discord.js';
import { STATELESS_COMMAND, END_OF_CONVERSATION } from '../state/StateManager';

const handlerHelp: HandlerType = async (manager: DiscordManager, message: Message) => {
    const stateManager = manager.getStateManager();
    const commands = manager.getCommandHandler().getCommands();

    stateManager.updateState(STATELESS_COMMAND, message);
    const messageEmbed = new MessageEmbed().setTitle('Commands')
                      .setAuthor('PandaBot')                    
                      
    commands.forEach(command => {
        messageEmbed.addField(command.getName(), command.getDescription());
    });

    message.reply(messageEmbed);
    stateManager.updateState(END_OF_CONVERSATION, message);
}

const testFn: MatcherFunction = (message: Message) => {
    return /help/.test(message.content);
}

const addCommand = new Command('help', 'dm', 'you just ran this command good job :)', testFn, handlerHelp);
export default addCommand;