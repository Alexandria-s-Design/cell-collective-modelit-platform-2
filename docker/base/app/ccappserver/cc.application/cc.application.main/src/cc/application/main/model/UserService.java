package cc.application.main.model;

import cc.common.data.transitory.UserDomainAccess;
import cc.common.data.user.AuthorityRequest;
import cc.common.data.user.Profile;
import cc.common.data.user.Role;
import cc.dataaccess.user.dao.UserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    UserDao userDao;

    public UserDomainAccess getCurrentUserDomainAccess(Profile profile) {
        Role instructor = userDao.getUserRole(Role.USER_ROLE.INSTRUCTOR),
                ad = userDao.getUserRole(Role.USER_ROLE.ADMINISTRATOR);
        boolean learn = true, teach = false, research = true;
        if (profile.getUser().getAuthorities().contains(instructor) ||
                profile.getUser().getAuthorities().contains(ad) ) {
            teach = true;
        }
        return new UserDomainAccess(research, teach, learn);
    }
}
