import { copyBooking, IBookingCopy } from "./booking/booking.copy";
import { HomeCopy, IHomeCopy } from "./home/home.copy";
import { copyPaseenger, IPaseengerCopy } from "./passenger/passenger.copy";
import { copySeat, ISeatCopy } from "./seat/seat.copy";

interface ICopysAvianca {
    homePage: IHomeCopy;
    bookingPage: IBookingCopy;
    passengerPage: IPaseengerCopy;
    seatPage: ISeatCopy;
}

type TGenericCopys = Partial<ICopysAvianca>;

const genericCopys: TGenericCopys = {
    homePage: {
        ...HomeCopy
    },
    bookingPage: {
        ...copyBooking
    },
    passengerPage: {
        ...copyPaseenger
    },
    seatPage: {
        ...copySeat
    }
};

export { genericCopys, type ICopysAvianca, type TGenericCopys };

