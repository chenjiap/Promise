(function (window) {
	function Promise(executor) {
		const  self = this
		self.data = undefined
		self.status = 'pending'
		self.callbacks = []
		
		function resolve(value) {
			self.data = value
			self.status = 'resolved'
			setTimeout(()=>{
				self.callbacks.forEach(cbObj=>cbObj.onResolved(value))
			})
      			
		}

		function reject(reason) {
			self.data = reason
			self.status = 'rejected'
			setTimeout(()=>{
				self.callbacks.forEach(cbObj=>cbObj.onRejected(reason))
			})

		}
		
		try{
			executor(resolve,reject)
		}catch(error){
			reject(error)
		}
		
	}
	
	Promise.prototype.then = function (onResolved,onRejected) {

		let promise2
		const self = this

		onResolved = typeof onResolved === 'function' ? onResolved : value => value
		onRejected = typeof onRejected === 'function' ? onRejected : reason => {throw error}

		if(self.status === 'resolved'){
			promise2 = new Promise((resolve,reject) => {
				setTimeout(() => {
					try{
						const x = onResolved(self.data)
						if(x instanceof Promise){
							x.then(resolve,reject)
						}else {
							resolve(x)
						}
					}catch(error){
						reject(error)
					}


				})



			})
		}
		else if(self.status === 'rejected'){
			promise2 = new Promise((resolve,reject) => {
				setTimeout(() => {
					try{
						const x = onRejected(self.data)
						if(x instanceof Promise){
							x.then(resolve,reject)
						}else {
							resolve(x)
						}
					}catch(error){
						reject(error)
					}


				})



			})
		}
	  else {
			promise2 = new Promise((resolve,reject) => {
				self.callbacks.push({
					onResolved(value){
						try{
							const x = onResolved(self.data)
							if(x instanceof Promise){
								x.then(resolve,reject)
							}else {
								resolve(x)
							}
						}catch(error){
							reject(error)
						}
					},
					onRejected(reason){
						try{
							const x = onRejected(self.data)
							if(x instanceof Promise){
								x.then(resolve,reject)
							}else {
								resolve(x)
							}
						}catch(error){
							reject(error)
						}
					}
				})
			})

		}

  return promise2

	}

	Promise.prototype.catch = function (onRejected) {
		return this.then(null,onRejected)
	}

	Promise.resolve = function (value) {
		return new Promise((resolve,reject) => {

				if(value instanceof Promise){
					value.then(resolve,reject)
				}else{
					resolve(value)
				}

		})
	}

	Promise.reject = function (reason) {
		return new Promise((resolve,reject) => {


				reject(reason)

		})
	}

	Promise.all = function (promises) {
		const length = this.callbacks.length
		const values = new Array(length)
		let valLenth = 0

		return new Promise((resolve,reject) => {
			promises.forEach((p,index) => {


				Promise.resolve(p).then(
					value => {
					if(this.data === value){
						values[index] = value
						valLenth++
					}
					if(values.length === length){
						resolve(values)
					}

				},
					reason => reject(reason)
				)

			})

		})
	}
	
	window.Promise = Promise
})(window)
