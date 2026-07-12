// Doctor is used both as `new Doctor(data)` (create) and as a namespace
// with static methods (findById, find, etc). A plain jest.fn() constructor
// mock with static props attached covers both usages.
jest.mock("../../models/Doctor.js", () => {
  const DoctorMock = jest.fn();
  DoctorMock.findById = jest.fn();
  DoctorMock.find = jest.fn();
  DoctorMock.countDocuments = jest.fn();
  DoctorMock.findByIdAndUpdate = jest.fn();
  DoctorMock.findByIdAndDelete = jest.fn();
  return { Doctor: DoctorMock };
});

import { Doctor } from "../../models/Doctor.js";
import {
  getDoctors,
  adminCreateDoctor,
  adminUpdateDoctor,
  adminDeleteDoctor,
} from "../../src/controllers/doctorController.js";

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res;
};

describe("doctorController.getDoctors (public)", () => {
  it("returns a single doctor by id when found", async () => {
    Doctor.findById.mockResolvedValue({ _id: "doc1", firstName: "Jane" });

    const req = { params: { id: "doc1" } };
    const res = mockRes();

    getDoctors(req, res, jest.fn());
    await flushPromises();

    expect(Doctor.findById).toHaveBeenCalledWith("doc1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: "doc1", firstName: "Jane" });
  });

  it("returns 404 when the doctor id doesn't exist", async () => {
    Doctor.findById.mockResolvedValue(null);

    const req = { params: { id: "missing" } };
    const res = mockRes();

    getDoctors(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Doctor not found" });
  });

  it("lists only active doctors when no id is given", async () => {
    const sortMock = jest.fn().mockResolvedValue([{ status: "active" }]);
    Doctor.find.mockReturnValue({ sort: sortMock });

    const req = { params: {} };
    const res = mockRes();

    getDoctors(req, res, jest.fn());
    await flushPromises();

    expect(Doctor.find).toHaveBeenCalledWith({ status: "active" });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("doctorController.adminCreateDoctor", () => {
  it("creates and saves a new doctor, returning 201", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    Doctor.mockImplementation((data) => ({ ...data, save: saveMock }));

    const req = {
      body: {
        firstName: "Jane",
        lastName: "Cruz",
        specialty: "Cardiology",
        department: "IM",
      },
    };
    const res = mockRes();

    adminCreateDoctor(req, res, jest.fn());
    await flushPromises();

    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("doctorController.adminUpdateDoctor", () => {
  it("returns 404 when updating a doctor that doesn't exist", async () => {
    Doctor.findByIdAndUpdate.mockResolvedValue(null);

    const req = { params: { id: "missing" }, body: { status: "inactive" } };
    const res = mockRes();

    adminUpdateDoctor(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns the updated doctor on success", async () => {
    Doctor.findByIdAndUpdate.mockResolvedValue({ _id: "doc1", status: "inactive" });

    const req = { params: { id: "doc1" }, body: { status: "inactive" } };
    const res = mockRes();

    adminUpdateDoctor(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Doctor updated successfully",
      doctor: { _id: "doc1", status: "inactive" },
    });
  });
});

describe("doctorController.adminDeleteDoctor", () => {
  it("returns 404 when deleting a doctor that doesn't exist", async () => {
    Doctor.findByIdAndDelete.mockResolvedValue(null);

    const req = { params: { id: "missing" } };
    const res = mockRes();

    adminDeleteDoctor(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("confirms deletion on success", async () => {
    Doctor.findByIdAndDelete.mockResolvedValue({ _id: "doc1" });

    const req = { params: { id: "doc1" } };
    const res = mockRes();

    adminDeleteDoctor(req, res, jest.fn());
    await flushPromises();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Doctor deleted successfully" });
  });
});