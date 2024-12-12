import React from "react";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import App, {getLinks} from "./App";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import store from "./store";
import { Provider } from "react-redux";
import { fetchPosts } from "./features/posts/postsSlice";



afterEach(cleanup);

it("renders without crashing", () => {
    render(<App />, <div />);
});

it("should take a snapshot", () => {
    const { asFragment } = render(<App />);

    expect(asFragment(<App />)).toMatchSnapshot();
});

test("Has Home Text", () => {
    const { getByText } = render(<App />);
    const linkElement = getByText(/Home/);
    expect(linkElement).toBeInTheDocument();
});

test("Has Post Text", () => {
    const { getByText } = render(<App />);
    const linkElement = getByText(/Post/);
    expect(linkElement).toBeInTheDocument();
});

test("Links should match", () => {
    const obj = getLinks();

    expect(obj).toEqual(
        expect.objectContaining([{
            path	: "/",
            text	: "Home"
        },
        {
            path	: "/posts",
            text	: "Posts"
        },
        {
            path	: "/posts/add",
            text	: "Add"
        },
        {
            path	: "/categories",
            text	: "Categories"
        },
        {
            path	: "/series",
            text	: "Series"
        }])
    );
});


const renderWithRouter = (component) => {
    const history = createMemoryHistory();
    return {
        ...render (
            <Router history={history}>
                {component}
            </Router>
        )
    };
};

it("should render the home page", () => {

    const { container, getByTestId } = renderWithRouter(<App />);
    const navbar = getByTestId("header");
    const link = getByTestId("Posts");

    expect(container.innerHTML).toMatch("Home");
    expect(navbar).toContainElement(link);
});

// /posts
it('should navigate to the posts page loading', ()=> {
    const unsubscribe = store.subscribe(() =>
        // eslint-disable-next-line no-console
        console.log('State after dispatch: ', store.getState())
    );
    store.dispatch(fetchPosts);
    unsubscribe();


    const { container, getByTestId } = renderWithRouter(<Provider store={store}><App /></Provider>);

    fireEvent.click(getByTestId('Posts'));

    expect(container.innerHTML).toMatch('Loading...');
});

it('should navigate to the posts page loaded', async () => {
    const { getByText , getByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('Posts'));

    const posts = await waitFor(() => getByText("Title"));

    expect(posts).toHaveTextContent('Title');
});

// /posts/add
it("should navigate to the add page loading", ()=> {
    const { container, getByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId("Add"));

    expect(container.innerHTML).toMatch("Loading...");
});

it("should navigate to the add page loaded", async () => {
    const { getByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId("Add"));

    const add = await waitFor(() => getByTestId("Save"));

    expect(add).toHaveAttribute("type", "submit");
}, 10000);

// /posts/edit
it('should navigate to the edit page loading', async ()=> {
    const { container, getByTestId, getByText } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('Posts'));

    await waitFor(() => getByText("Title"));

    fireEvent.click(getByTestId('38'));

    expect(container.innerHTML).toMatch('Loading...');
});

it('should navigate to the edit page loaded', async ()=> {
    const { getByTestId, getByText } = renderWithRouter(<App />);

    fireEvent.click(getByTestId('Posts'));

    await waitFor(	() => getByText("Title"));

    fireEvent.click(getByTestId('38'));

    const edit = await waitFor(() => getByTestId("Save"));

    expect(edit).toHaveAttribute('type', 'submit');
}, 10000);

// /categories
it("should navigate to the categories page loading", ()=> {
    const { container, getByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId("Categories"));

    expect(container.innerHTML).toMatch("Loading...");
});

it("should navigate to the categories page loaded", async ()=> {
    const { getByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId("Categories"));

    const posts = await waitFor(() => getByTestId("About Me"));

    expect(posts).toHaveClass("Category");
});

// /series
it("should navigate to the series page loading", ()=> {
    const { container, getByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId("Series"));

    expect(container.innerHTML).toMatch("Loading...");
});

it("should navigate to the series page loaded", async ()=> {
    const { getByTestId } = renderWithRouter(<App />);

    fireEvent.click(getByTestId("Series"));

    const	series			= await waitFor(() => getByTestId("Patagonia")),
        seriesManage	= getByTestId("Patagonia_manage");

    expect(series).toHaveClass("Series");
    expect(seriesManage).toHaveClass("series-manage-click");
});