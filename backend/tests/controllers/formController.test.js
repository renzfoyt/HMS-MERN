// BookingForm/ContactForm are used both as `new Model(data)` (create) and
// as a namespace with static methods (find, findById, etc) — same dual-use
// mock shape as models/Doctor.js in doctorController.test.js.
jest.mock("../../models/Form.js", () => {
  const BookingFormMock = jest.fn();
  BookingFormMock.find = jest.fn();
  BookingFormMock.findById = jest.fn();
  BookingFormMock.findByIdAndUpdate = jest.fn();
  BookingFormMock.findByIdAndDelete = jest.fn();

  const ContactFormMock = jest.fn();
  ContactFormMock.findById = jest.fn();
  ContactFormMock.findByIdAndUpdate = jest.fn();
  ContactFormMock.findByIdAndDelete = jest.fn();

  return { BookingForm: BookingFormMock, ContactForm: ContactFormMock };
});

// adminGetBookings/adminGetContacts delegate list-building to the shared
// paginate() utility — mock it directly so these tests only exercise
// formController's own logic (id lookup, 404s, header setting), not
// pagination math that belongs to paginate.js.
jest.mock("../../src/utils/paginate.js", () => ({
  paginate: jest.fn(),
}));

import { BookingForm, ContactForm } from "../../models/Form.js";
import { paginate } from "../../src/utils/paginate.js";
import {
  bookForm,
  getBookedSlots,
  contactForm,
  adminGetBookings,
  adminUpdateBooking,
  adminDeleteBooking,
  adminGetContacts,
  adminUpdateContact,
  adminDeleteContact,
} from "../../src/controllers/formController.js";

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res;
};

const bookingBody = {
  department: "Cardiology",
  service: "Consultation",
  preferredDate: "2026-08-01",
  preferredTime: "10:00 AM",
  firstName: "Juan",
  lastName: "Dela Cruz",
  mobileNum: "09171234567",
  email: "juan@example.com",
};

describe("formController.bookForm", () => {
  it("saves a new booking and returns 200 on success", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    BookingForm.mockImplementation((data) => ({ ...data, save: saveMock }));

    const req = { body: bookingBody };
    const res = mockRes();
    const next = jest.fn();

    bookForm(req, res, next);
    await flushPromises();

    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Booking request received successfully" }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 409 with a friendly message when the slot is already taken (duplicate key)", async () => {
    const saveMock = jest.fn().mockRejectedValue({ code: 11000 });
    BookingForm.mockImplementation((data) => ({ ...data, save: saveMock }));

    const req = { body: bookingBody };
    const res = mockRes();
    const next = jest.fn();

    bookForm(req, res, next);
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "That date and time slot was just booked by someone else. Please choose a different time.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards non-duplicate-key errors to the error handler instead of swallowing them", async () => {
    const dbError = new Error("Connection lost");
    const saveMock = jest.fn().mockRejectedValue(dbError);
    BookingForm.mockImplementation((data) => ({ ...data, save: saveMock }));

    const req = { body: bookingBody };
    const res = mockRes();
    const next = jest.fn();

    bookForm(req, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("formController.getBookedSlots", () => {
  it("returns 400 when no date query param is given", async () => {
    const req = { query: {} };
    const res = mockRes();

    getBookedSlots(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "A valid date query param is required" });
    expect(BookingForm.find).not.toHaveBeenCalled();
  });

  it("returns 400 when the date query param isn't a parseable date", async () => {
    const req = { query: { date: "not-a-date" } };
    const res = mockRes();

    getBookedSlots(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("queries the full calendar day, excludes cancelled bookings, and returns just the times", async () => {
    BookingForm.find.mockResolvedValue([
      { preferredTime: "9:00 AM" },
      { preferredTime: "10:00 AM" },
    ]);

    const req = { query: { date: "2026-08-01" } };
    const res = mockRes();

    getBookedSlots(req, res, jest.fn());
    await flushPromises();

    expect(BookingForm.find).toHaveBeenCalledWith(
      expect.objectContaining({
        preferredDate: expect.objectContaining({ $gte: expect.any(Date), $lt: expect.any(Date) }),
        status: { $ne: "cancelled" },
      }),
      "preferredTime -_id",
    );

    // endOfDay should be exactly one calendar day after startOfDay
    const [[queryArg]] = BookingForm.find.mock.calls;
    const { $gte: startOfDay, $lt: endOfDay } = queryArg.preferredDate;
    expect(endOfDay.getTime() - startOfDay.getTime()).toBe(24 * 60 * 60 * 1000);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ bookedTimes: ["9:00 AM", "10:00 AM"] });
  });
});

describe("formController.contactForm", () => {
  it("saves a new contact submission and returns 200", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    ContactForm.mockImplementation((data) => ({ ...data, save: saveMock }));

    const req = {
      body: { name: "Maria", email: "maria@example.com", mobileNum: "09171234567", message: "Hi" },
    };
    const res = mockRes();

    contactForm(req, res, jest.fn());
    await flushPromises();

    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Contact request received successfully" }),
    );
  });
});

describe("formController.adminGetBookings", () => {
  it("returns a single booking by id when found", async () => {
    BookingForm.findById.mockResolvedValue({ _id: "b1", status: "pending" });

    const req = { params: { id: "b1" } };
    const res = mockRes();

    adminGetBookings(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: "b1", status: "pending" });
  });

  it("returns 404 when the booking id doesn't exist", async () => {
    BookingForm.findById.mockResolvedValue(null);

    const req = { params: { id: "missing" } };
    const res = mockRes();

    adminGetBookings(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Booking not found" });
  });

  it("lists bookings via paginate and sets the X-Total-Count header", async () => {
    paginate.mockResolvedValue({ items: [{ _id: "b1" }], total: 1, page: 1, limit: 1000 });

    const req = { params: {}, query: {} };
    const res = mockRes();

    adminGetBookings(req, res, jest.fn());
    await flushPromises();

    expect(paginate).toHaveBeenCalledWith(BookingForm, expect.objectContaining({ sort: { createdAt: -1 } }));
    expect(res.set).toHaveBeenCalledWith("X-Total-Count", 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ _id: "b1" }]);
  });
});

describe("formController.adminUpdateBooking", () => {
  it("returns 404 when updating a booking that doesn't exist", async () => {
    BookingForm.findByIdAndUpdate.mockResolvedValue(null);

    const req = { params: { id: "missing" }, body: { status: "handled" } };
    const res = mockRes();

    adminUpdateBooking(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns the updated booking on success (e.g. cancelling frees the slot)", async () => {
    BookingForm.findByIdAndUpdate.mockResolvedValue({ _id: "b1", status: "cancelled" });

    const req = { params: { id: "b1" }, body: { status: "cancelled" } };
    const res = mockRes();

    adminUpdateBooking(req, res, jest.fn());
    await flushPromises();

    expect(BookingForm.findByIdAndUpdate).toHaveBeenCalledWith(
      "b1",
      { status: "cancelled" },
      { new: true, runValidators: true },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Booking updated successfully",
      booking: { _id: "b1", status: "cancelled" },
    });
  });
});

describe("formController.adminDeleteBooking", () => {
  it("returns 404 when deleting a booking that doesn't exist", async () => {
    BookingForm.findByIdAndDelete.mockResolvedValue(null);

    const req = { params: { id: "missing" } };
    const res = mockRes();

    adminDeleteBooking(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("confirms deletion on success", async () => {
    BookingForm.findByIdAndDelete.mockResolvedValue({ _id: "b1" });

    const req = { params: { id: "b1" } };
    const res = mockRes();

    adminDeleteBooking(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Booking deleted successfully" });
  });
});

describe("formController.adminGetContacts", () => {
  it("returns a single contact by id when found", async () => {
    ContactForm.findById.mockResolvedValue({ _id: "c1", status: "pending" });

    const req = { params: { id: "c1" } };
    const res = mockRes();

    adminGetContacts(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: "c1", status: "pending" });
  });

  it("returns 404 when the contact id doesn't exist", async () => {
    ContactForm.findById.mockResolvedValue(null);

    const req = { params: { id: "missing" } };
    const res = mockRes();

    adminGetContacts(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Contact not found" });
  });

  it("lists contacts via paginate and sets the X-Total-Count header", async () => {
    paginate.mockResolvedValue({ items: [{ _id: "c1" }], total: 1, page: 1, limit: 1000 });

    const req = { params: {}, query: {} };
    const res = mockRes();

    adminGetContacts(req, res, jest.fn());
    await flushPromises();

    expect(paginate).toHaveBeenCalledWith(ContactForm, expect.objectContaining({ sort: { createdAt: -1 } }));
    expect(res.set).toHaveBeenCalledWith("X-Total-Count", 1);
    expect(res.json).toHaveBeenCalledWith([{ _id: "c1" }]);
  });
});

describe("formController.adminUpdateContact", () => {
  it("returns 404 when updating a contact that doesn't exist", async () => {
    ContactForm.findByIdAndUpdate.mockResolvedValue(null);

    const req = { params: { id: "missing" }, body: { status: "handled" } };
    const res = mockRes();

    adminUpdateContact(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns the updated contact on success", async () => {
    ContactForm.findByIdAndUpdate.mockResolvedValue({ _id: "c1", status: "handled" });

    const req = { params: { id: "c1" }, body: { status: "handled" } };
    const res = mockRes();

    adminUpdateContact(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Contact updated successfully",
      contact: { _id: "c1", status: "handled" },
    });
  });
});

describe("formController.adminDeleteContact", () => {
  it("returns 404 when deleting a contact that doesn't exist", async () => {
    ContactForm.findByIdAndDelete.mockResolvedValue(null);

    const req = { params: { id: "missing" } };
    const res = mockRes();

    adminDeleteContact(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("confirms deletion on success", async () => {
    ContactForm.findByIdAndDelete.mockResolvedValue({ _id: "c1" });

    const req = { params: { id: "c1" } };
    const res = mockRes();

    adminDeleteContact(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Contact deleted successfully" });
  });
});