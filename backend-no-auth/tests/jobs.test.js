const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Job = require('../models/jobModel');

const jobs = [
    {
    title: "Web Developer",
    type: "Part-Time",
    description: "Come work with us!",
    company: {
      name: "Test Company",
      contactEmail: "test@test.com",
      contactPhone: "1234567890"
    }  
    },
    {
        title: "Backend Developer",
    type: "Full time",
    description: "Come here to work",
    company: {
      name: "Test Company 2",
      contactEmail: "test2@test2.com",
      contactPhone: "0987654321"
    }
    },
];

describe("Job controller", () => {
    beforeEach(async () => {
        await Job.deleteMany({});
        await Job.insertMany(jobs);
    });

    afterAll(() => {
        mongoose.connection.close();
    });

    // Test GET /api/jobs
    it("should return all jobs as JSON when GET /api/jobs is called", async () => {
        const response = await api
            .get("/api/jobs")
            .expect(200)
            .expect("Content-Type", /application\/json/);

        expect(response.body).toHaveLength(jobs.length);
    });

    // Test POST /api/jobs
    it("should create a new job when POST /api/jobs is called", async () => {
        const newJob = {
            title: "Frontend Developer",
            type: "Full-Time",
            description: "Come work with us!",
            company: {
                name: "Test Company 3",
                contactEmail: "test3@test3.com",
                contactPhone: "1234567890"
        }
    };
    await api
        .post("/api/jobs")
        .send(newJob)
        .expect(201)
        .expect("Content-Type", /application\/json/);

    const jobsAfterPost = await Job.find({});
    expect(jobsAfterPost).toHaveLength(jobs.length + 1);
    const jobTitles = jobsAfterPost.map((job) => job.title);
    expect(jobTitles).toContain(newJob.title);
    });
    
    // Test GET /api/jobs/:id
    it("should return one job by ID when GET /api/jobs/:id is called", async () => {
        const job = await Job.findOne();
        await api
            .get(`/api/jobs/${job._id}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);
    });

    it("should return 404 for non-existing job ID", async () => {
        const nonExistingId = new mongoose.Types.ObjectId();
        await api.get(`/api/jobs/${nonExistingId}`).expect(404);
});

    //Test PUT /api/jobs/:id
    it("should update a job when PUT /api/jobs/:id is called", async () => {
        const job = await Job.findOne();
        const updatedJob = {
            title: "Updated Job",
            type: "Full-Time",
        };

        await api
            .put(`/api/jobs/${job._id}`)
            .send(updatedJob)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const jobsAfterPut = await Job.findById(job._id);
        expect(jobsAfterPut.title).toBe(updatedJob.title);
        expect(jobsAfterPut.type).toBe(updatedJob.type);
    });

    it("should return 400 for non-existing job ID", async () => {
        const invalidId = "12345";
        await api.put(`/api/jobs/${invalidId}`).send({}).expect(400);
    });

    // Test DELETE /api/jobs/:id
    it("should delete one job by ID when DELETE /api/jobs/:id is called", async () => {
        const job = await Job.findOne();
        await api.delete(`/api/jobs/${job._id}`).expect(204);

        const deletedJobCheck = await Job.findById(job._id);
        expect(deletedJobCheck).toBeNull();
    });

    it("should return 400 for invalid job ID when DELETE /api/jobs/:id", async () => {
        const invalidId = "12345";
        await api.delete(`/api/jobs/${invalidId}`).expect(400);
    });
});