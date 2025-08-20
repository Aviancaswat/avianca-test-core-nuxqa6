import type { Lang, Position, TMethodAvianca, TpageAvianca } from "../../types/copy.type";
import { copyBooking, IBookingCopy } from "./booking/booking.copy";
import { HomeCopy, IHomeCopy } from "./home/home.copy";
import { copyPaseenger, IPaseengerCopy } from "./passenger/passenger.copy";
import { copySeat, ISeatCopy } from "./seat/seat.copy";

type ExtendTypeTest = {
    id: string;
    description: string;
    language: Lang;
    position: Position;
    targetPage: TpageAvianca,
    targetMethod: TMethodAvianca
}

type TCopysAvianca = IHomeCopy & IBookingCopy & IPaseengerCopy & ISeatCopy & ExtendTypeTest;
type TGenericCopys = Partial<TCopysAvianca>;

let genericCopys: TGenericCopys = {
    ...HomeCopy,
    ...copyBooking,
    ...copyPaseenger,
    ...copySeat
};

const setDataTest = (data: TGenericCopys) => {
    genericCopys = { ...genericCopys, ...data }
}

export { genericCopys, setDataTest, type TCopysAvianca, type TGenericCopys };

