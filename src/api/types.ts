export interface BookingDates {
  /** YYYY-MM-DD */
  checkin: string;
  /** YYYY-MM-DD */
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}
