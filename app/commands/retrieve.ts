import Command, {HandlerType, MatcherFunction} from './Command';
import DiscordManager from '../DiscordManager';
import { Message } from 'discord.js';
import { STATELESS_COMMAND, END_OF_CONVERSATION } from '../state/StateManager';

const handlerRetrieve: HandlerType = async (manager: DiscordManager, message: Message) => {
    const databaseManager = manager.getDatabaseManager();
    const stateManager = manager.getStateManager();

    stateManager.updateState(STATELESS_COMMAND, message);
    const matchResult = /retrieve (\w+)/.exec(message.content);
    if(matchResult && matchResult.length == 2){
        const collection = matchResult[1];
        const allRecords = await databaseManager.all(collection);
        if(allRecords !== false && Array.isArray(allRecords)){
            const allContent = allRecords.map(item => item.content).join(',');
            message.reply(`Below is all content that was added to collection \`${collection}\`:`)
            message.reply(allContent);
        } else {
            message.reply(`Failed to retrieve content from collection \`${collection}\``);
        }
    }else{
        message.reply(`Format of command incorrect please try again!`)
    }
    stateManager.updateState(END_OF_CONVERSATION, message);
}

const testFn: MatcherFunction = (message: Message) => {
    return /retrieve \w+/.test(message.content);
}

const retrieveCommand = new Command('retrieve', 'dm', 'Retrieves all messages from a collection', testFn, handlerRetrieve);
export default retrieveCommand;