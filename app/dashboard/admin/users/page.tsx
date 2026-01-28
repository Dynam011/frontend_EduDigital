"use client"

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  created_at: string;
}

export default function AdminUsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [editId, setEditId] = useState<string | null>(null);
	const [editData, setEditData] = useState<Partial<User>>({});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		async function fetchUsers() {
			setLoading(true);
			try {
				const res = await fetch("http://localhost:4000/api/users");
				const data = await res.json();
        console.log(data);
				setUsers(data);
			} catch (err) {
				setUsers([]);
			} finally {
				setLoading(false);
			}
		}
		fetchUsers();
	}, []);

	const handleEdit = (user: User) => {
		setEditId(user.id);
		setEditData(user);
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			await fetch(`http://localhost:4000/api/users/${editId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editData),
			});
			setEditId(null);
			setEditData({});
			// Refrescar usuarios
			const res = await fetch("http://localhost:4000/api/users");
			setUsers(await res.json());
		} catch (err) {
			// Manejar error
		} finally {
			setSaving(false);
		}
	};

	return (
		<Card className="shadow-lg border-0">
			<CardHeader>
				<CardTitle className="text-xl">Gestión de Usuarios</CardTitle>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="py-8 text-center text-lg animate-pulse">Cargando usuarios...</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm border rounded-lg">
							<thead className="bg-gray-100">
								<tr>
									<th className="p-2 text-left">Nombre</th>
									<th className="p-2 text-left">Email</th>
									<th className="p-2 text-left">Tipo</th>
									  <th className="p-2 text-left">Fecha de creación</th>
									<th className="p-2 text-left">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user) => (
									<tr key={user.id} className="border-b">
										<td className="p-2">
											{editId === user.id ? (
												<input
													className="border rounded px-2 py-1 w-32"
													value={editData.first_name || ""}
													onChange={e => setEditData({ ...editData, first_name: e.target.value })}
												/>
											) : (
												`${user.first_name} ${user.last_name}`
											)}
										</td>
										<td className="p-2">
											{editId === user.id ? (
												<input
													className="border rounded px-2 py-1 w-40"
													value={editData.email || ""}
													onChange={e => setEditData({ ...editData, email: e.target.value })}
												/>
											) : (
												user.email
											)}
										</td>
										<td className="p-2">
											{editId === user.id ? (
												<select
													className="border rounded px-2 py-1"
													value={editData.user_type || ""}
													onChange={e => setEditData({ ...editData, user_type: e.target.value })}
												>
													<option value="student">Estudiante</option>
													<option value="teacher">Profesor</option>
													<option value="admin">Administrador</option>
												</select>
											) : (
												user.user_type
											)}
										</td>
										<td className="p-2">{user.created_at ? new Date(user.created_at).toLocaleString() : "-"}</td>
										<td className="p-2">
											{editId === user.id ? (
												<Button size="sm" onClick={handleSave} disabled={saving}>
													Guardar
												</Button>
											) : (
												<Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
													<Pencil className="h-4 w-4 mr-1 inline" /> Editar
												</Button>
											)}
										</td>
									</tr>
								))}
								{users.length === 0 && (
									<tr>
										<td colSpan={5} className="p-4 text-center text-gray-500">No hay usuarios registrados.</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
