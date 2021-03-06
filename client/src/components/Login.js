import axios from "axios";
import Swal from "sweetalert2";
import { useState, useContext, useEffect } from "react";
import withReactContent from "sweetalert2-react-content";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Card, Control, Label, Hr, Error, Spinner } from "../style/Login";
import { Context } from "../utils/stateProvider";
import { useForm } from "react-hook-form";

const MySwal = withReactContent(Swal);

function Login() {
  document.querySelector("body").style.backgroundColor = "#0062cc";

  const store = useContext(Context);

  const [state, UNSAFE_setState] = useState({ message: "", error: false });
  const setState = (data) => UNSAFE_setState({ ...state, ...data });

  useEffect(() => {
    axios.post("/auth/session", { checking: true }).then(({ data }) => {
      if (data.isExist) {
        const Loading = MySwal.fire({
          html: (
            <div>
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">
                Anda sudah login, sedang mengambil data dari server
              </p>
            </div>
          ),
          ...store.config.sweetal.Login,
        });

        axios
          .post("/auth/session", {
            exist: data.isExist,
            checking: !data.isExist,
          })
          .then(({ data }) => {
            store.setUID(data.id);
            store.setUsername(data.username);
            store.setJWT(data.token);
            store.setRole(data.role);
            Loading.close();
            store.setLogin(true);
          });
      }
    });
  });

  const { register, handleSubmit, errors, setValue } = useForm();

  const onSubmit = (data) => {
    const Loading = MySwal.fire({
      html: (
        <div>
          <Spinner animation="border" variant="primary" />
        </div>
      ),
      ...store.config.sweetal.Login,
    });

    axios
      .post("/auth/login", data)
      .then(({ data }) => {
        store.setUID(data.user.id);
        store.setUsername(data.user.username);
        store.setNewLogin(true);
        store.setJWT(data.user.token);
        store.setRole(data.user.role);
        Loading.close();
        store.setLogin(true);
      })
      .catch((err) => {
        const res = err.response;

        if (res.status === 500) {
          setState({
            message:
              "Server sedang mengalami masalah, tunggu beberapa saat lagi.",
            error: true,
          });
          setValue("email", "");
          setValue("password", "");
          Loading.close();
        } else if (res.status === 400) {
          const e = res.data.errors;

          setState({ message: e.message, error: true });
          Loading.close();

          switch (e.type) {
            case "PASS_ERR":
              setValue("password", "");
              break;
            case "ACC_404":
              setValue("email", "");
              setValue("password", "");
              break;
            default:
              return null;
          }
        }
      });
  };

  return (
    <Container>
      <Row className="justify-content-center mt-4">
        <Col md={5}>
          <Card>
            <Card.Body>
              {state.error && (
                <Alert
                  variant="danger"
                  onClose={() => setState({ error: false })}
                  dismissible
                >
                  {state.message}
                </Alert>
              )}
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group>
                  <Label>Email</Label>
                  <Control
                    name="email"
                    ref={register({
                      required: true,
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Format email tidak valid !",
                      },
                    })}
                    type="email"
                    placeholder="Masukan email"
                  />
                  {errors.email && (
                    <Error
                      msg={
                        errors.email.message
                          ? errors.email.message
                          : "Bidang ini perlu diisi !"
                      }
                    />
                  )}
                </Form.Group>
                <Form.Group>
                  <Label>Kata Sandi</Label>
                  <Control
                    name="password"
                    ref={register({ required: true })}
                    type="password"
                    placeholder="Masukan kata sandi"
                  />
                  {errors.password && <Error msg="Bidang ini perlu diisi !" />}
                </Form.Group>
                <Hr />
                <Button variant="primary" className="btn-block" type="submit">
                  Login
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
