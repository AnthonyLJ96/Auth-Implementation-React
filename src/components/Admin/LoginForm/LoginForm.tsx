import React from 'react';
import './LoginForm.scss';
import {Button, Form} from "semantic-ui-react";
import {useFormik} from 'formik';
import {toast} from 'react-toastify';
import * as Yup from 'yup';
import {useAuth} from '../../../hooks';

export function LoginForm() {
    const {login} = useAuth();

    const form = useFormik({
        initialValues: initialValues(),
        validationSchema: Yup.object(validationSchema()),
        onSubmit: async (body, fields) => {
            try {
                await login(body);

                // await authService.login(body);
                // const response = await loginApi(body);
                // login(response.access_token);
                // await getMe();
            } catch (e: any) {
                console.error(e);
                toast.error(e.message);
            }
        },
    });

    return (
        <div>
            <Form className="login-form-admin" onSubmit={form.handleSubmit}>
                <Form.Input name="email" placeholder="Email"
                            value={form.values.email}
                            onChange={form.handleChange}
                            error={form.errors.email}/>
                <Form.Input name="password" placeholder="Password" type="password"
                            value={form.values.password}
                            onChange={form.handleChange}
                            error={form.errors.password}/>
                <Button type="submit" content="Iniciar sesión" primary fluid/>
            </Form>
        </div>
    );
}

function initialValues() {
    return {
        email: '',
        password: ''
    }
}

function validationSchema() {
    return {
        email: Yup.string().email('It must be an email').required('Required'),
        password: Yup.string().required('Required'),
    };
}
