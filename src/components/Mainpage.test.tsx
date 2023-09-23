// add test for TodoCard
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Mainpage from "./Mainpage";
import { act, fireEvent, render } from "@testing-library/react";

// Create a new instance of the mock adapter
const mock = new MockAdapter(axios);

// Mock a GET request to '/api/data' and return a response
mock.onPost("http://localhost:3000/tasks/create").reply(200, {
  data: {
    id: 1,
    message: "wash dishes",
    completed: false,
  },
});

mock.onGet("http://localhost:3000/tasks").reply(200, {
  data: {
    id: 1,
    message: "new task",
    completed: false,
  },
});

describe("POST http://localhost:3000/tasks/create", () => {
  it("returns the correct response and data", async () => {
    const response = await axios.post("http://localhost:3000/tasks/create", {
      message: "wash dishes",
      completed: false,
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      data: {
        id: 1,
        message: "wash dishes",
        completed: false,
      },
    });
  });

  // test that mainpage renders the form
  it("renders the form", () => {
    const wrapper = render(<Mainpage />);
    console.log(wrapper);
    expect(wrapper.getByTestId("task-form")).toBeInTheDocument();
  });

  // test that mainpage calls the handleSubmit function on submit

  it("renders newly added tasks ", async () => {
    const newTask = {
      id: 2,
      message: "tests",
      completed: false,
    };

    const wrapper = render(<Mainpage />);
    const form = wrapper.getByTestId("task-form");

    fireEvent.change(wrapper.getByTestId("task-input"), {
      target: { value: newTask.message },
    });

    fireEvent.submit(form);

    expect(wrapper.getAllByText(`Task: ${newTask.message}`)).toHaveLength(1);
  });
  // test that mainpage renders the todo card given the data
  //
});
