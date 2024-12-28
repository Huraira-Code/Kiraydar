import axios from 'axios';

const SignIn = async data => {
  console.log(data);
  try {
    const dataResponse = await axios.post(
      'http://192.168.0.37:2000/api/user/signin',
      {
        email: data.email,
        password: data.password,
      },
    );
    console.log(dataResponse.data);
  } catch (error) {
    console.log(error);
  }
};

const SignUp = async data => {
  console.log(data);
};

export {SignIn, SignUp};
