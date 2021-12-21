import { Form, Link, LoaderFunction, useLoaderData } from "remix";
import { getUser } from "~/utils/sessions.server";
import type { User } from "@prisma/client";

type LoaderData = {
  user: User | null | undefined;
};

export let loader: LoaderFunction = async ({ request }) => {
  let user = await getUser(request);

  let data: LoaderData = {
    user,
  };

  return data;
};

export default function Index() {
  let data = useLoaderData<LoaderData>();

  return (
    <div>
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/">Home</Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          TODO
        </div>
      </main>
      <footer className="jokes-footer">
        <div className="container">
          FOOTER
        </div>
      </footer>
    </div>
  );
}
