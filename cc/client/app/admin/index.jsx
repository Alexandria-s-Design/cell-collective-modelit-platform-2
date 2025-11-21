import React, { useContext, useEffect, useState } from 'react'
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import Table from './Table';
import { CCContext } from '../containers/Application';
import toastr from 'toastr';


const groups = [
	{
		"id": 1,
		"name": "ADMINS",
		"permissions": []
	},
	{
		"id": 2,
		"name": "EDITORS",
		"permissions": []
	},
	{
		"id": 3,
		"name": "VIEWERS",
		"permissions": []
	},
	{
		"id": 4,
		"name": "STUDENTS",
		"permissions": []
	},
	{
		"id": 5,
		"name": "TEACHERS",
		"permissions": []
	},
	{
		"id": 6,
		"name": "RESEARCHERS",
		"permissions": []
	},
	{
		"id": 7,
		"name": "GUESTS",
		"permissions": []
	}, 
	{
		"id": 8,
		"name": "TEACHERACCESSAPPROVERS",
		"permissions": []
	}
];

const CustomOption = ({ name, value, iconPresent }) => (
	<option name={name} value={value}>
		{iconPresent ? name + ' ✅' : name}
	</option>
)
const Dashboard = () => {
	const { cc } = useContext(CCContext)
	const [token, setToken] = useState(cc?.state?.user?.token || null)
	const [page, setPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [sort, setSort] = useState(null);

	useEffect(() => {
		if (cc?.state?.user?.token) {
			setToken(cc?.state?.user?.token)
		}
	}, [cc?.state?.user?.token])

	const queryClient = useQueryClient();
	const { isPending, error, data } = useQuery({
		queryKey: ['rbac-users', page, searchTerm, sort],
		queryKey: ['rbac-users', page, searchTerm, sort, token],
		queryFn: async () => {
			const url = new URL(`${import.meta.env.VITE_CC_URL_CCAPP}/users/`);
			url.searchParams.set('page', page.toString());
			if (searchTerm) url.searchParams.set('search', searchTerm);
			if (sort) {
				const ordering = sort.direction === 'desc' ? `-${sort.field}` : sort.field;
				url.searchParams.set('ordering', ordering);
			}
		
			const res = await fetch(url.toString(), {
				headers: { 'Authorization': `Bearer ${token}` },
			});
			return res.json();
		},
		keepPreviousData: true,
		enabled: !!token
	})

	const mutation = useMutation({
		mutationFn: async ({ enable, user }) => {
			let response
			if (enable) {
				response = await fetch(`${import.meta.env.VITE_CC_URL_CCAPP}/users/enable/${user.profile.user.id}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				})
			} else {
				response = await fetch(`${import.meta.env.VITE_CC_URL_CCAPP}/users/disable/${user.profile.user.id}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				})
			}
			if (response.ok) {
				const updatedUser = { ...user }
				updatedUser.user.is_active = enable
				return updatedUser
			} else {
				console.log(`error occured enabling/disabling user.`)
				throw new Error('Failed to update user status.');
			}
		},
		onSuccess: (newUser) => {
			// Update the cached data after the mutation succeeds
			queryClient.setQueryData(['rbac-users', page], (oldData) =>
				oldData.map((user) => (user.profile.id === newUser.profile.id ? newUser : user)));
			// below approach doesn't maintain order of users in table resulting in bad UX	
			// queryClient.invalidateQueries(['rbac-users']);
		},
		onError: (error) => {
			console.error('Mutation error:', error.message);
		},
	});

	const handleClick = (activity, user) => {
		mutation.mutate({ enable: activity, user });
	};

	const groupMutation = useMutation({
		mutationFn: async ({ group, action, user }) => {
			let response
			if (action == 'add') {
				response = await fetch(`${import.meta.env.VITE_CC_URL_CCAPP}/users/assign/group-permission`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ "user_id": user.profile.user.id, "group": group })
				})
			} else if (action == 'remove') {
				response = await fetch(`${import.meta.env.VITE_CC_URL_CCAPP}/users/remove/group-permission`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ "user_id": user.profile.user.id, "group": group })
				})
			} else if (action == 'reject') {
				response = await fetch(`${import.meta.env.VITE_CC_URL_CCAPP}/users/group/reject-request`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ "user_id": user.profile.user.id, "group": group })
				})
			}

			if (response.ok) {
				const updatedUser = { ...user }
				if (action == 'add') {
					updatedUser.groups = [{ name: group }]
				} else if (action == 'remove') {
					const updatedGroups = updatedUser.groups.filter(g => g.name !== group)
					updatedUser.groups = updatedGroups
				}
				if (updatedUser.pending_request.name == group) {
					updatedUser.pending_request.name = '';
				}
				return updatedUser
			} else {
				console.log(`error occured adding/removing user group.`)
				throw new Error('Failed to update user groups.');
			}
		},
		onSuccess: (newUser) => {
			// Update the cached data after the mutation succeeds
			queryClient.setQueryData(['rbac-users', page], (oldData) =>
				oldData.map((user) => (user.profile.id === newUser.profile.id ? newUser : user)));
			// below approach doesn't maintain order of users in table resulting in bad UX	
			// queryClient.invalidateQueries(['rbac-users']);
		},
		onError: (error) => {
			console.error('User Group Mutation error:', error.message);
		},
	});

	const handleGroupChange = (e, user) => {
		const action = e.target.value.split('-')[1]
		const group = e.target.value.split('-')[0]
		groupMutation.mutate({ group, action, user })
	}

	const handleReject = (user) => {
		const group = user.pending_request.name;
		const action = "reject";
		groupMutation.mutate({group, action,  user})
	}

	let users = []

	if (!token) return <div className='overlay' style={{marginTop: "72px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column",height: "calc(100vh - 72px"}}>
		<div className='container-fluid' style={{width: "100%", textAlign: "center", color: "white"}}>
			<h1>YOU'RE CURRENTLY SIGNED OUT!</h1>	
			<h2 style={{textTransform: "capitalize"}}>You Need to login.</h2>		
		</div>
		</div>

	const smalllogo = document.body.offsetWidth < 768

	if (isPending) return 'Loading...'

	if (error) return 'An error has occurred: ' + error.message

	if (data) {
		users = data.data.results
	}
  
	const socket = new WebSocket(`${import.meta.env.VITE_CC_WS_CCAPP}/notifications/?token=${token}`);
	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		let options = {
			timeOut: 0,
			extendedTimeOut: 0,
		}
		toastr[`info`](`${data.message}`,`User Group Request`, {"positionClass": "toast-bottom-right", ...options})
	}

	const columns = [
		{ title: '#', get: (e) => null },
		{ title: 'Username', get: (e) => e?.user.username, sortable: true, sortKey: 'user__username'},
		{ title: 'Email', get: (e) => e?.user.email, sortable: true, sortKey: 'user__email'},
		{ title: 'Date Created', get: (e) => e?.user.date_joined ? format(new Date(e.user.date_joined), 'yyyy-MM-dd') : '', sortable: true, sortKey: 'user__date_joined' },
		{ title: 'Requested', get: (e) => e?.pending_request.name ? (
				<span>
					<span style={{ color: "red" }}>{e.pending_request.name}</span>
					<button style={{ marginLeft: "1em", }}
								onClick={ () => handleReject(e) }> Reject</button>
				</span>
			) : ''
		, sortable: true, sortKey: 'pending_request__name' },
		{ title: 'Groups', get: (e) => e?.groups ? e.groups.map((i, j) => j % groups.length > 0 ? `, ${i.name} ` : i.name) : '', sortable: true, sortKey: 'groups__0__name' },
		{
			title: 'Update Groups', get: (e) => {
				return <div>
					<select id='user-groups' onChange={(c) => handleGroupChange(c, e)} name='group'>
						{groups.map(f => {
							const isPresent = e.groups.some((pg) => pg.name === f.name);
							return <CustomOption iconPresent={isPresent} name={f.name} value={isPresent ? `${f.name}-remove` : `${f.name}-add`} key={`${f.id}-group`} />
						})}
					</select>
				</div>
			}
		},
		{ title: 'Status', get: (e) => e?.user.is_active ? <div><CircleIcon style={{ color: '#10c469', fontSize: '12px' }} /> Enabled</div> : <div><CircleIcon style={{ color: 'orange', fontSize: '12px' }} /> Disabled</div>, sortValue: (e) => e?.user.is_active ? 1 : 0, sortable: true, sortKey: 'user__is_active' },
		{
			title: 'Action',
			get: (e) => {
				return e?.user.is_active ?
					<div onClick={() => handleClick(false, e)}><ToggleOffOutlinedIcon style={{ color: 'orange' }} /> Disable </div>
					: <div onClick={() => handleClick(true, e)}><ToggleOnOutlinedIcon style={{ color: '10c469' }} /> Enable </div>
			},
			sortValue: (e) => e?.user.is_active ? 1 : 0,
			sortable: true,
			sortKey: 'user__is_active'
		}
	].map((col, key) => ({ id: key, ...col }));

	return (
		<div style={{ marginTop: "75px" }}>
			<div className='container-fluid' style={{ marginTop: '10px' }}>
				{users && <Table autoIncrementRows={true} maxHeight={1000} searchTerm={searchTerm} sortField={sort?.field}
  sortDirection={sort?.direction} onSortChange={(field, direction) => {setPage(1); setSort({ field, direction }); }} onSearch={(term) => {setPage(1); setSearchTerm(term);}} data={users} columns={columns}/>}
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
					{data.data?.previous && <button onClick={() => setPage(page - 1)} style={{ border: 'none' }}>{'<<'}</button>}
					<div>{page}</div>
					{data.data?.next && <button onClick={() => setPage(page + 1)} style={{ border: 'none' }}>{'>>'}</button>}
				</div>
			</div>
		</div>
	)
}

export default Dashboard