import { MongoClient, Db } from 'mongodb';

type Result<T> = T | boolean;

export type SendResults = "duplicate" | "error" | "ok";

export default class DatabaseHandler{
    private client: MongoClient;
    private databaseName: string;
    private databaseObj?: Db;

    constructor(databaseName: string){
        if(process.env.DB_USER && process.env.DB_PASS){
            this.client = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@scribblecluster.sqash.mongodb.net/${databaseName}?retryWrites=true&w=majority`, { useUnifiedTopology: true });
            this.databaseName = databaseName;
        }else{
            throw new Error('Database username or pass was not provided!');
        }        
    }

    private async connect(){
        if(!this.databaseObj){
            const dbConnection = await this.client.connect();
            this.databaseObj = dbConnection.db(this.databaseName)
        }        
    }

    public async send(collection: string, json: Record<string, any>, checkMatching = true): Promise<SendResults>{
        await this.connect();
        if(this.databaseObj){
            const matchingElement = await this.databaseObj.collection(collection).findOne(json);
            if(checkMatching && matchingElement){
                return 'duplicate';
            }
            const insert = (await this.databaseObj.collection(collection).insertOne(json)).result
            return insert.ok == 1 ? 'ok' : 'error';
        }
        return 'error';
    }

    public async all(collection: string): Promise<Result<Record<string, unknown>[]>>{
        await this.connect();
        if(this.databaseObj){
            try{
                const allObjects = await this.databaseObj.collection(collection).find({}).toArray();
                return allObjects;
            }catch{
                return false;
            }
        }
        return false;
    }

    public async remove(collection: string, json: Record<string, unknown>){
        await this.connect();
        if(this.databaseObj){
            try{
                const deleted = (await this.databaseObj.collection(collection).deleteOne(json)).result
                return deleted.ok == 1;
            }catch{
                return false;
            }
        }
        return false;
    }

    public async count(collection: string, json: Record<string, unknown>): Promise<Result<number>>{
        await this.connect();
        if(this.databaseObj){
            try{
                const numberOfDocuments = await this.databaseObj.collection(collection).find(json).count();
                return numberOfDocuments;
            }catch{
                return false;
            }
        }
        return false;
    }

    public async purge(collection: string){
        await this.connect();
        if(this.databaseObj){
            try{
                const deleted = (await this.databaseObj.collection(collection).deleteMany({})).result
                return deleted.ok == 1;
            }catch{
                return false;
            }
        }
        return false;
    }
}