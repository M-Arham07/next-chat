
import { User } from "#/web/packages/shared/db/models/user.schema.ts";
import { ConnectDB } from "#/web/packages/shared/db/connect-db.ts";
import { Threads } from "../../../web/packages/shared/db/models/thread.schema.ts"

export async function getUserRooms(username: string): Promise<string[]> {


    try {

        await ConnectDB();
        await Threads.findOne({ email: "F" })

    }
    catch (err) {

    }


}