import { useState, useEffect } from 'react';
import {Table, Button, Spinner, FormGroup, Input} from 'reactstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'react-toastify';
import { get, del } from '../services/apiService';
import UserForm from "../components/UserForm.jsx";
import { FaPen, FaTrash } from 'react-icons/fa';


function UserList() {
	const [users, setUsers] = useState([]);
	const [initialLoading, setInitialLoading] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState({});
	const [skip, setSkip] = useState(0);
	const [total, setTotal] = useState(0);
	const [searchQuery, setSearchQuery] = useState('');
	const limit = 10;

	useEffect(() => {
		const existingUsers = localStorage.getItem('users');
		const usersArray = existingUsers ? JSON.parse(existingUsers).reverse() : [];
		if (usersArray.length > 0) {
			setUsers((prevUsers) => [...prevUsers, ...usersArray]);
		}
		fetchUsers(true);
	}, []);

	const fetchUsers = async (isInitial = false) => {
		if (isInitial) {
			setInitialLoading(true);
		} else {
			setIsLoadingMore(true);
		}
		try {
			const url = `/users?limit=${limit}&skip=${skip}&sortBy=id&order=desc`;
			const data = await get(url);

			if (data?.users) {
				const existingIds = new Set(users.map((user) => user.id));
				const newUsers = data.users.filter((user) => !existingIds.has(user.id));
				if (newUsers.length > 0) {
					setUsers((prevUsers) => [...prevUsers, ...newUsers]);
				}
				setTotal(data.total || 0);
			}
		} catch (err) {
			setError('Hata: Kullanıcılar yüklenemedi.');
			toast.error('Kullanıcılar yüklenemedi.');
		} finally {
			if (isInitial) {
				setInitialLoading(false);
			} else {
				setIsLoadingMore(false);
			}
		}
	};

	const loadMore = () => {
		if (users.length < total) {
			setSkip((prevSkip) => prevSkip + limit);
		}
	};

	useEffect(() => {
		if (skip > 0) {
			fetchUsers();
		}
	}, [skip]);

	const handleDelete = async (id) => {
		if (window.confirm(`${id} idye sahip kullanıcıyı silmek istediğinize emin misiniz?`)) {
			try {
				const existingUsers = localStorage.getItem('users');
				if (existingUsers) {
					const usersArray = JSON.parse(existingUsers);
					const updatedUsers = usersArray.filter((user) => user.id !== id);
					localStorage.setItem('users', JSON.stringify(updatedUsers));
				}

				setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
				toast.success('Kullanıcı başarıyla silindi.');
			} catch (err) {
				setError('Hata: Kullanıcı silinemedi.');
				toast.error('Kullanıcı silinemedi.');
			}
		}
	};


	const toggleModal = (user = null) => {
		setSelectedUser(user);
		setIsModalOpen(!isModalOpen);
	};

	const handleUserAddedOrUpdated = (updatedUser) => {
		if (selectedUser) {
			setUsers((prevUsers) => {
				const updatedUsers = prevUsers.map((user) =>
					                                   user.id === selectedUser.id ? updatedUser : user
				);
				return updatedUsers;
			});
			toast.success('Kullanıcı başarıyla güncellendi.');
		} else {
			setUsers((prevUsers) => {
				const updatedUsers = [{ ...updatedUser }, ...prevUsers];
				return updatedUsers;
			});
			toast.success('Kullanıcı başarıyla eklendi.');
		}
		toggleModal();
	};

	const filteredUsers = users.filter((user) =>
		                                   `${user.firstName} ${user.lastName} ${user.email}`
		                                   .toLowerCase()
		                                   .includes(searchQuery.toLowerCase())
	);


	return (
		<>
			<div className="header-section">
				<h2>- Kullanıcı Listesi -</h2>
			</div>
			<div className="container mt-4">
				<div className="d-flex justify-content-between align-items-end mb-3">
					<FormGroup className="w-50">
						<Input
							id="search"
							type="text"
							placeholder="Kullanıcı Ara..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</FormGroup>
					<button className="mb-3 primary-button justify-content-end" onClick={() => toggleModal()}>
						Yeni Kullanıcı Ekle
					</button>
				</div>

				{initialLoading && (
					<div className="text-center my-3">
						<Spinner className={"secondary-color"} />
						<span className="ms-2">Yükleniyor</span>
					</div>
				)}
				{error && <p className="text-danger">{error}</p>}
				<div className={"table-border mb-10"}>
					<InfiniteScroll
						dataLength={filteredUsers.length}
						next={loadMore}
						hasMore={filteredUsers.length < total}
						loader={
							isLoadingMore && (
								<div className="text-center my-3">
									<Spinner className={"secondary-color"} />
									<span className="ms-2">loading...</span>
								</div>
							)
						}
						endMessage={<p className="text-center primary-color mt-3">Tüm kullanıcılar yüklendi.</p>}
					>
						<Table striped hover>
							<thead>
							<tr>
								<th>ID</th>
								<th>İsim</th>
								<th>E-posta</th>
								<th>İşlemler</th>
							</tr>
							</thead>
							<tbody>
							{filteredUsers.map((user,index) => (
								<tr key={index}>
									<td>{user.id}</td>
									<td>{user.firstName + ' ' + user.lastName}</td>
									<td>{user.email}</td>
									<td>
										<Button
											color="success"
											size="sm"
											className="mx-2"
											onClick={() => toggleModal(user)}
											title="Güncelle"
											outline
										>
											<FaPen />
										</Button>
										<Button
											color="danger"
											size="sm"
											onClick={() => handleDelete(user.id)}
											title="Sil"
										>
											<FaTrash />
										</Button>
									</td>
								</tr>
							))}
							</tbody>
						</Table>
					</InfiniteScroll>
					{users.length < total && (
						<div className="text-center my-3">
							<button className="loadmore-button" onClick={loadMore}>
								Daha Fazla Göster
							</button>
						</div>
					)}
				</div>
				<UserForm
					user={selectedUser}
					total={total}
					isOpen={isModalOpen}
					toggle={toggleModal}
					onUserAddedOrUpdated={handleUserAddedOrUpdated}
				/>
			</div>
		</>

	);
}

export default UserList;
