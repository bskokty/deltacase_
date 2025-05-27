import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Modal, ModalHeader, ModalBody, Button, FormGroup, Label, Input } from 'reactstrap';
import { get, post, put } from '../services/apiService';
import {toast} from "react-toastify";

const validationSchema = Yup.object({
	                                    name: Yup.string()
	                                    .required('İsim zorunlu')
	                                    .min(2, 'İsim en az 2 karakter olmalı')
	                                    .test('at-least-two-words', 'Lütfen en az bir isim ve soyisim girin', (value) => {
		                                    if (!value) return false;
		                                    const parts = value.trim().split(' ');
		                                    return parts.length >= 2;
	                                    }),
	                                    email: Yup.string()
	                                    .email('Geçerli bir e-posta adresi girin')
	                                    .required('E-posta zorunlu'),
	                                    age: Yup.number()
	                                    .typeError('Yaş sayısal bir değer olmalı')
	                                    .positive('Yaş pozitif bir sayı olmalı')
	                                    .integer('Yaş tam sayı olmalı')
	                                    .required('YAş zorunlu'),
                                    });
function UserForm({ user, total, isOpen, toggle, onUserAddedOrUpdated }) {
	const [initialValues, setInitialValues] = useState({ name: '', email: '', age: '' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);


	const handleToggle = () => {
		setInitialValues({ name: '', email: '', age: '' });
		setLoading(false);
		setError(null);
		toggle();
	};

	useEffect(() => {
		if (user && user.id) {
			setInitialValues(
				{name: user.firstName + ' ' + user.lastName,
				       email: user.email,
						age: user.age || ''});
		} else {
			setInitialValues({ name: '', email: '', age: '' });
		}
	}, [user]);

	const handleSubmit = async (values, { setSubmitting }) => {
		setLoading(true);
		setError(null);
		try {
			const nameParts = values.name.trim().split(' ');
			const lastName = nameParts.pop();
			const firstName = nameParts.join(' ');
			const payload = {
				firstName,
				lastName,
				email: values.email,
				age: parseInt(values.age, 10),
			};

			const existingUsers = localStorage.getItem('users');
			const usersArray = existingUsers ? JSON.parse(existingUsers) : [];

			if (user && user.id) {
				payload['id'] = user.id;
				const updatedUsers = usersArray.map((u) =>
					                                    u.id === user.id ? { ...payload, id: user.id } : u
				);
				localStorage.setItem('users', JSON.stringify(updatedUsers));
			} else {
				const response = await post('/users/add', payload);

				payload['id'] = total + 1;
				if(usersArray.length){
					payload['id'] = parseInt(usersArray[usersArray.length - 1].id) + 1;
				}

				usersArray.push(payload);
				localStorage.setItem('users', JSON.stringify(usersArray));
			}
			onUserAddedOrUpdated(payload);
			handleToggle();
		} catch (err) {
			setError('Hata: İşlem başarısız.');
			toast.error('İşlem başarısız.');
		} finally {
			setLoading(false);
			setSubmitting(false);
		}
	};


	return (
		<Modal isOpen={isOpen} toggle={handleToggle}>
			<ModalHeader toggle={handleToggle}>{user && user.id ? 'Kullanıcı Güncelle' : 'Kullanıcı Ekle'}</ModalHeader>
			<ModalBody>
				{loading && <p>Yükleniyor...</p>}
				{error && <p className="text-danger">{error}</p>}
				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={handleSubmit}
					enableReinitialize
				>
					{({ isSubmitting }) => (
						<Form>
							<FormGroup>
								<Label for="name">İsim Soyisim</Label>
								<Field
									name="name"
									as={Input}
									type="text"
									placeholder="İsim Soyisim"
									id="name"
								/>
								<ErrorMessage name="name" component="div" className="text-danger" />
							</FormGroup>
							<FormGroup>
								<Label for="email">E-posta</Label>
								<Field
									name="email"
									as={Input}
									type="email"
									placeholder="ornek@mail.com"
									id="email"
								/>
								<ErrorMessage name="email" component="div" className="text-danger" />
							</FormGroup>
							<FormGroup>
								<Label for="age">Yaş</Label>
								<Field
									name="age"
									as={Input}
									type="number"
									placeholder="Yaşınızı girin"
									id="age"
									min="1"
								/>
								<ErrorMessage name="age" component="div" className="text-danger" />
							</FormGroup>
							<div className={"d-flex flex-row justify-content-end gap-2"}>
								<Button
									type="submit"
									color="success"
									disabled={isSubmitting || loading}
								>
									{user && user.id ? 'Güncelle' : 'Ekle'}
								</Button>
								<Button color="danger"
									onClick={toggle}
									disabled={loading}>
									İptal
								</Button>
							</div>
						</Form>
					)}
				</Formik>
			</ModalBody>
		</Modal>
	);
}

export default UserForm;
