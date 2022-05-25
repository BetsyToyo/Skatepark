
$(function(){

    $('#btn-registro').click(function(event){
        event.preventDefault();
        const formData = new FormData();
        const imagefile = document.querySelector('#file');
        formData.append("fotoSkater", imagefile.files[0]);
        formData.append("email", $('#registrar-email').val());
        formData.append("nombre", $('#registrar-nombre').val());
        formData.append("password", $('#registrar-password').val());
        formData.append("experiencia", $('#registrar-experiecia').val());
        formData.append("especialidad", $('#registrar-especialidad').val());
       
        
        let password=$('#registrar-password').val();
        let rpassword= $('#registrar-rpassword').val();
        
        if (password !== rpassword) {
            alert("Los ingresos de password no coinciden")
            return
        }    
        axios.post('/registro', 
             formData
            ,{
            headers: {
            'Content-Type': 'multipart/form-data'
            }
            })
            .then(function (response) {
            console.log(response);
            $(location).attr('href','http://localhost:3000/login');
            })
            .catch(function (error) {
            console.log(error);
            });

    })
    
    $("#form-login").submit(function(event){
        event.preventDefault();
        $.ajax({
            method: 'post',
            url: '/login',
            dataType: 'json',
            data: {email: $('#login-email').val(),
                    password: $('#login-password').val()},
            success: function(data){
                alert(data.message);                
                localStorage.setItem("token", data.token) 
               if (data.skater == 'admin@gmail.com') {
                    $(location).attr('href','http://localhost:3000/admin');
               } else {
                    $(location).attr('href','http://localhost:3000/datos');
               }              
               
                inputsDatos()
            },
            error: function(error){
                if(error.status == 403){
                    alert(error.responseJSON.message)
                    window.location.reload()
                } else {
                    alert("Ocurrió un error interno en el servidor")
                }
            }
        })
    })
    
    let idEdicion;

    const inputsDatos = () => {
        const token = localStorage.getItem("token");
        $.ajax({
            url: '/registros',
            method: 'get',
            dataType: 'json',
            headers: {
                authorization: token
            },
            success: function(data){                
                idEdicion= data.data[0].id
                
            },
            error: function(error){
                if(error.status == 403){
                    alert(error.responseJSON.message);
                    localStorage.removeItem("token");                    
                } else {
                    alert("Ocurrió un error interno en el servidor")
                }
            }
        })
    }    
    
    
    $("#btn-editar").click(function(event){
        event.preventDefault();      
        idEdicion= $('#oculto').val()
        $.ajax({
            method: 'PUT',
            url: '/registro',
            dataType: 'json',            
            data: {nombre: $('#nombre-edit').val(),
                    password: $('#password-edit').val(),
                    experiencia: $('#expe-edit').val(),
                    especialidad: $('#espe-edit').val(),
                    id: idEdicion
                },
                        
            success: function(){
                alert('Usuario editado con exito');   
                            
            },
            error: function(error){
                alert(error.message)
            }
        })
    })

    $("#btn-eliminar").click(function(event){
        event.preventDefault();
                    
        idEliminar= $('#oculto').val()
        $.ajax({
            method: 'DELETE',
            url: `/registro?id=${idEliminar}`,
            dataType: 'json',             
                    
            success: function(){
                alert('Usuario eliminado con exito'); 
                localStorage.removeItem("token");   
                $(location).attr('href','http://localhost:3000/login');        

            },
            error: function(error){
                alert(error.message)
            }
        })
    })

    
    $("#btn-logout").click(function() {   
        localStorage.removeItem("token");
        window.location.href='/';
        return false 
    })

   
    
})
