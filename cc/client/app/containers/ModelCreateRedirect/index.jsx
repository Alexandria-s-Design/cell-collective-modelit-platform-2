import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from "react-router-dom";
import { CCContext } from '../Application'


const RedirectToCreateModel = () => {
	const { cc } = useContext(CCContext)
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams();
	const modelType = searchParams.get("modelType") || 'boolean';
	useEffect(() => {
		function redirectToCreate() {
			navigate(`/dashboard`)
			setTimeout(() => { 
				// wait for the page to finish loading
				cc.modelAdd(undefined, null, { modelType })
			}, 500)
		}
		redirectToCreate();
	}, [])


	return (
		<div>
			<h1>Redirecting to Create Model ...</h1>
		</div>
	);

}

export default RedirectToCreateModel