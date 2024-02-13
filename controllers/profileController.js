import PROFILE from "../mongodb/profileSchema.js";

export const getProfileByEmail = async (req, res) => {
  const { email } = req.params;
  console.log(email);
  try {
    //check if profile exsits
    const profile = await PROFILE.profileExist(email);
    if (!profile) {
      return res.status(400).json({ msg: "Unauthorized action" });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
export const updateProfile = (req, res) => {
  const { email } = req.parmas;
};
