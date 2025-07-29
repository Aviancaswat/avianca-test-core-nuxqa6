import { copyBooking, IBookingCopy } from "./booking/booking.copy";
import { HomeCopy, IHomeCopy } from "./home/home.copy";
import { copyPaseenger, IPaseengerCopy } from "./passenger/passenger.copy";
import { copySeat, ISeatCopy } from "./seat/seat.copy";

type TCopysAvianca = IHomeCopy & IBookingCopy & IPaseengerCopy & ISeatCopy;
type TGenericCopys = Partial<TCopysAvianca>;

let genericCopys: TGenericCopys = {
    ...HomeCopy,
    ...copyBooking,
    ...copyPaseenger,
    ...copySeat
};

const setDataTest = (data: TGenericCopys) => {
    console.log("Data seteada: ", data);
    genericCopys = { ...genericCopys, ...data }
}

export { genericCopys, setDataTest, type TCopysAvianca, type TGenericCopys };

