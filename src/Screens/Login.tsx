import { useState } from "react";
import "./Loginandsignup.style.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { userLogin, userRegistration } from "../Services/Api/Services";
import { toast } from "react-toastify";

function Login() {
  const [containerFlag, setContainerFlag] = useState(false);
  const singUpHandler = () => {
    setContainerFlag(true);
  };
  const singInHandler = () => {
    setContainerFlag(false);
  };

  // login validation
  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = (values: any, { setSubmitting }: any) => {
    userLogin({
      body: values,
    })
      .then((res: any) => {
        sessionStorage.setItem("accessToken", res?.accessToken);
        sessionStorage.setItem("userData", JSON.stringify(res?.getUser));
        window.location.href = "/chat";
        window.location.reload();
        toast.success("Login successfully");
      })
      ?.catch((err: any) => toast.error(err.data.message));
    setSubmitting(false);
  };
  // ------------------

  //signup validation
  const initialValuesSignUp = {
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchemaSignUp = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    username: Yup.string().required("Email is required"),
    password: Yup.string().required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), undefined], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const handleSubmitSignUp = (
    values: any,
    { setSubmitting, resetForm }: any
  ) => {
    userRegistration({
      body: {
        name: values.name,
        email: values.username,
        password: values.password,
      },
    })
      .then((res: any) => {
        singInHandler();
        resetForm();
        toast.success("Sign up successfully");
      })
      .catch((err: any) => toast.error(err.data.message));
    setSubmitting(false);
  };
  //-----------------
  return (
    <>
      <div className={`login-area ${containerFlag ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="sign-in-form">
                  <h2 className="title">Log In</h2>
                  <div className="input-field">
                    <i className="fas fa-envelope"></i>
                    <Field type="email" name="email" placeholder="Email" />
                  </div>
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error-message"
                  />
                  <div className="input-field">
                    <i className="fas fa-lock"></i>
                    <Field
                      type="password"
                      name="password"
                      placeholder="Password"
                    />
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="error-message"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-login solid"
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </button>
                </Form>
              )}
            </Formik>

            <Formik
              initialValues={initialValuesSignUp}
              validationSchema={validationSchemaSignUp}
              onSubmit={handleSubmitSignUp}
            >
              {({ isSubmitting }) => (
                <Form className="sign-up-form">
                  <h2 className="title">Sign up</h2>
                  <div className="input-field">
                    <i className="fas fa-user"></i>
                    <Field type="text" name="name" placeholder="Name" />
                  </div>
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="error-message"
                  />
                  <div className="input-field">
                    <i className="fas fa-envelope"></i>
                    <Field type="email" name="username" placeholder="Email" />
                  </div>
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="error-message"
                  />
                  <div className="input-field">
                    <i className="fas fa-lock"></i>
                    <Field
                      type="password"
                      name="password"
                      placeholder="Password"
                    />
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="error-message"
                  />
                  <div className="input-field">
                    <i className="fas fa-lock"></i>
                    <Field
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                    />
                  </div>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="error-message"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-login"
                  >
                    {isSubmitting ? "Signing up..." : "Sign up"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New to our community ?</h3>
              <p>
                Discover a world of possibilities! Join us and explore a vibrant
                community where ideas flourish and connections thrive.
              </p>
              <button className="btn-login transparent" onClick={singUpHandler}>
                Sign up
              </button>
            </div>
            <img
              src="https://i.ibb.co/6HXL6q1/Privacy-policy-rafiki.png"
              className="image"
              alt=""
            />
          </div>
          <div className="panel right-panel">
            <div className="content">
              <h3>One of Our Valued Members</h3>
              <p>
                Thank you for being part of our community. Your presence
                enriches our shared experiences. Let's continue this journey
                together!
              </p>
              <button className="btn-login transparent" onClick={singInHandler}>
                Log in
              </button>
            </div>
            <img
              src="https://i.ibb.co/nP8H853/Mobile-login-rafiki.png"
              className="image"
              alt=""
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
