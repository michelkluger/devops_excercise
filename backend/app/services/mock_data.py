"""Faker-based mock data for AD users, RPM packages, and seed VMs."""

from faker import Faker

fake = Faker()
Faker.seed(42)

AD_USERS: list[dict] = []
RPM_PACKAGES: list[dict] = []

# Fixed users with known roles for RBAC simulation
SYSTEM_USERS: list[dict] = [
    {"username": "a.mueller", "full_name": "Andreas Mueller", "role": "admin", "department": "IT Services"},
    {"username": "s.weber", "full_name": "Stefan Weber", "role": "operator", "department": "Controls"},
    {"username": "l.fischer", "full_name": "Laura Fischer", "role": "viewer", "department": "Photon Science"},
]

ROLE_PERMISSIONS: dict[str, set[str]] = {
    "admin": {"view", "create", "edit", "delete", "stop", "start", "reboot"},
    "operator": {"view", "create", "edit", "stop", "start", "reboot"},
    "viewer": {"view"},
}

_RPM_NAMES = [
    "nginx",
    "httpd",
    "postgresql-server",
    "mysql-server",
    "redis",
    "docker-ce",
    "podman",
    "git",
    "vim-enhanced",
    "tmux",
    "htop",
    "curl",
    "wget",
    "jq",
    "tree",
    "openssh-server",
    "openssl",
    "nmap",
    "tcpdump",
    "strace",
    "python3",
    "python3-pip",
    "nodejs",
    "golang",
    "java-17-openjdk",
    "gcc",
    "make",
    "cmake",
    "gdb",
    "valgrind",
    "ansible",
    "terraform",
    "puppet",
    "chef",
    "salt",
    "prometheus",
    "grafana",
    "elasticsearch",
    "logstash",
    "kibana",
    "zsh",
    "bash-completion",
    "man-pages",
    "bind-utils",
    "net-tools",
    "rsync",
    "tar",
    "gzip",
    "bzip2",
    "xz",
    "firewalld",
    "iptables",
    "selinux-policy",
    "audit",
    "aide",
    "cronie",
    "at",
    "systemd-journal-remote",
    "lvm2",
    "mdadm",
    "nfs-utils",
    "samba",
    "cifs-utils",
    "autofs",
    "sssd",
    "haproxy",
    "keepalived",
    "corosync",
    "pacemaker",
    "drbd",
    "zabbix-agent",
    "nagios-plugins",
    "collectd",
    "telegraf",
    "filebeat",
    "kernel-devel",
    "dkms",
    "perf",
    "bpftrace",
    "sysstat",
    "podman-compose",
    "buildah",
    "skopeo",
    "cri-o",
    "containerd",
    "etcd",
    "consul",
    "vault",
    "nomad",
    "boundary",
    "certbot",
    "mod_ssl",
    "ca-certificates",
    "gnupg2",
    "pam",
    "tuned",
    "irqbalance",
    "numad",
    "numactl",
    "hwloc",
    "chrony",
    "ntp",
    "ptp4l",
    "gpsd",
    "timedatectl",
    "fio",
    "iperf3",
    "stress-ng",
    "sysbench",
    "bonnie++",
    "root",
    "epics-base",
    "cs-studio",
    "sardana",
    "tango-controls",
    "hdf5",
    "nexus-tools",
    "mantid",
    "sasview",
    "mcxtrace",
]

_PSI_DEPARTMENTS = [
    "NUM",
    "NES",
    "GFA",
    "BIO",
    "ENE",
    "Photon Science",
    "Large Research Facilities",
    "Nuclear Energy and Safety",
    "IT Services",
    "Controls",
    "Accelerator Operations",
    "Beamline Science",
]

SEED_VMS = [
    {
        "name": "sls2-control-01",
        "cpu": 32,
        "ram": 65536,
        "disk": 500,
        "os": "RHEL 9",
        "network": "machine",
        "status": "running",
        "users": [
            {"username": "a.mueller", "full_name": "Andreas Mueller", "is_sudoer": True},
            {"username": "s.weber", "full_name": "Stefan Weber", "is_sudoer": True},
            {"username": "l.fischer", "full_name": "Laura Fischer", "is_sudoer": False},
        ],
        "packages": [
            {"name": "epics-base", "version": "7.0.8"},
            {"name": "cs-studio", "version": "4.7.1"},
            {"name": "prometheus", "version": "2.51.0"},
            {"name": "grafana", "version": "10.4.1"},
            {"name": "postgresql-server", "version": "16.2.0"},
        ],
    },
    {
        "name": "sinq-camea-daq",
        "cpu": 16,
        "ram": 32768,
        "disk": 2000,
        "os": "Rocky Linux 9",
        "network": "machine",
        "status": "running",
        "users": [
            {"username": "m.keller", "full_name": "Martin Keller", "is_sudoer": True},
            {"username": "e.braun", "full_name": "Eva Braun", "is_sudoer": False},
        ],
        "packages": [
            {"name": "mantid", "version": "6.9.1"},
            {"name": "hdf5", "version": "1.14.3"},
            {"name": "nexus-tools", "version": "5.0.0"},
            {"name": "python3", "version": "3.12.3"},
            {"name": "redis", "version": "7.2.4"},
        ],
    },
    {
        "name": "swissfel-alvra-proc",
        "cpu": 64,
        "ram": 262144,
        "disk": 4000,
        "os": "RHEL 9",
        "network": "machine",
        "status": "running",
        "users": [
            {"username": "c.milne", "full_name": "Christopher Milne", "is_sudoer": True},
            {"username": "p.juranić", "full_name": "Pavle Juranić", "is_sudoer": True},
            {"username": "r.ischebeck", "full_name": "Rasmus Ischebeck", "is_sudoer": False},
            {"username": "k.zhang", "full_name": "Kai Zhang", "is_sudoer": False},
        ],
        "packages": [
            {"name": "python3", "version": "3.12.3"},
            {"name": "hdf5", "version": "1.14.3"},
            {"name": "root", "version": "6.32.2"},
            {"name": "cmake", "version": "3.29.0"},
            {"name": "gcc", "version": "14.1.0"},
            {"name": "cuda-toolkit", "version": "12.4.0"},
        ],
    },
    {
        "name": "sls2-tomcat-recon",
        "cpu": 48,
        "ram": 131072,
        "disk": 8000,
        "os": "RHEL 9",
        "network": "machine",
        "status": "running",
        "users": [
            {"username": "m.stampanoni", "full_name": "Marco Stampanoni", "is_sudoer": True},
            {"username": "f.marone", "full_name": "Federica Marone", "is_sudoer": True},
        ],
        "packages": [
            {"name": "python3", "version": "3.12.3"},
            {"name": "hdf5", "version": "1.14.3"},
            {"name": "gcc", "version": "14.1.0"},
            {"name": "cmake", "version": "3.29.0"},
            {"name": "nginx", "version": "1.25.4"},
        ],
    },
    {
        "name": "hipa-target-mon",
        "cpu": 8,
        "ram": 16384,
        "disk": 200,
        "os": "RHEL 8",
        "network": "machine",
        "status": "running",
        "users": [
            {"username": "d.reggiani", "full_name": "Daniela Reggiani", "is_sudoer": True},
            {"username": "m.seidel", "full_name": "Mike Seidel", "is_sudoer": False},
        ],
        "packages": [
            {"name": "epics-base", "version": "7.0.8"},
            {"name": "tango-controls", "version": "9.4.2"},
            {"name": "grafana", "version": "10.4.1"},
            {"name": "telegraf", "version": "1.30.0"},
        ],
    },
    {
        "name": "proscan-gantry2-ctrl",
        "cpu": 8,
        "ram": 8192,
        "disk": 100,
        "os": "RHEL 9",
        "network": "machine",
        "status": "running",
        "users": [
            {"username": "a.lomax", "full_name": "Antony Lomax", "is_sudoer": True},
        ],
        "packages": [
            {"name": "epics-base", "version": "7.0.8"},
            {"name": "python3", "version": "3.12.3"},
            {"name": "openssl", "version": "3.2.1"},
        ],
    },
    {
        "name": "musr-dolly-analysis",
        "cpu": 16,
        "ram": 32768,
        "disk": 500,
        "os": "Rocky Linux 9",
        "network": "office",
        "status": "running",
        "users": [
            {"username": "z.salman", "full_name": "Zaher Salman", "is_sudoer": True},
            {"username": "t.prokscha", "full_name": "Thomas Prokscha", "is_sudoer": False},
            {"username": "h.luetkens", "full_name": "Hubertus Luetkens", "is_sudoer": False},
        ],
        "packages": [
            {"name": "root", "version": "6.32.2"},
            {"name": "python3", "version": "3.12.3"},
            {"name": "mantid", "version": "6.9.1"},
            {"name": "hdf5", "version": "1.14.3"},
            {"name": "gnuplot", "version": "5.4.10"},
        ],
    },
    {
        "name": "it-gitlab-runner-03",
        "cpu": 8,
        "ram": 16384,
        "disk": 250,
        "os": "Ubuntu 24.04",
        "network": "office",
        "status": "running",
        "users": [
            {"username": "j.schmid", "full_name": "Jonas Schmid", "is_sudoer": True},
        ],
        "packages": [
            {"name": "docker-ce", "version": "26.1.0"},
            {"name": "git", "version": "2.45.0"},
            {"name": "golang", "version": "1.22.2"},
            {"name": "nodejs", "version": "20.12.0"},
        ],
    },
    {
        "name": "sls2-pxiii-det-test",
        "cpu": 16,
        "ram": 65536,
        "disk": 1000,
        "os": "RHEL 9",
        "network": "test",
        "status": "stopped",
        "users": [
            {"username": "b.schmitt", "full_name": "Bernd Schmitt", "is_sudoer": True},
            {"username": "a.mozzanica", "full_name": "Aldo Mozzanica", "is_sudoer": True},
        ],
        "packages": [
            {"name": "epics-base", "version": "7.0.8"},
            {"name": "python3", "version": "3.12.3"},
            {"name": "hdf5", "version": "1.14.3"},
            {"name": "root", "version": "6.32.2"},
        ],
    },
    {
        "name": "swissfel-bernina-sim",
        "cpu": 32,
        "ram": 65536,
        "disk": 500,
        "os": "RHEL 9",
        "network": "test",
        "status": "provisioning",
        "users": [
            {"username": "g.ingold", "full_name": "Gerhard Ingold", "is_sudoer": True},
        ],
        "packages": [
            {"name": "python3", "version": "3.12.3"},
            {"name": "cmake", "version": "3.29.0"},
            {"name": "gcc", "version": "14.1.0"},
            {"name": "mcxtrace", "version": "3.4.0"},
        ],
    },
    {
        "name": "sinq-amor-reduce",
        "cpu": 8,
        "ram": 16384,
        "disk": 300,
        "os": "Rocky Linux 9",
        "network": "office",
        "status": "running",
        "users": [
            {"username": "j.stahn", "full_name": "Jochen Stahn", "is_sudoer": True},
            {"username": "a.devishvili", "full_name": "Artur Devishvili", "is_sudoer": False},
        ],
        "packages": [
            {"name": "mantid", "version": "6.9.1"},
            {"name": "sasview", "version": "5.0.6"},
            {"name": "python3", "version": "3.12.3"},
            {"name": "hdf5", "version": "1.14.3"},
        ],
    },
    {
        "name": "it-monitoring-prom",
        "cpu": 4,
        "ram": 8192,
        "disk": 500,
        "os": "Ubuntu 22.04",
        "network": "office",
        "status": "running",
        "users": [
            {"username": "j.schmid", "full_name": "Jonas Schmid", "is_sudoer": True},
            {"username": "n.bachmann", "full_name": "Nina Bachmann", "is_sudoer": True},
        ],
        "packages": [
            {"name": "prometheus", "version": "2.51.0"},
            {"name": "grafana", "version": "10.4.1"},
            {"name": "nginx", "version": "1.25.4"},
            {"name": "certbot", "version": "2.9.0"},
            {"name": "filebeat", "version": "8.13.0"},
        ],
    },
]


def generate_mock_data() -> None:
    """Generate mock AD users and RPM packages with a fixed seed."""
    Faker.seed(42)

    AD_USERS.clear()
    RPM_PACKAGES.clear()

    AD_USERS.extend(
        [
            {
                "username": fake.user_name(),
                "full_name": fake.name(),
                "email": fake.company_email(),
                "department": fake.random_element(_PSI_DEPARTMENTS),
            }
            for _ in range(50)
        ]
    )

    RPM_PACKAGES.extend(
        [
            {
                "name": name,
                "version": f"{fake.random_int(0, 9)}.{fake.random_int(0, 30)}.{fake.random_int(0, 99)}",
                "description": f"Package {name}",
            }
            for name in _RPM_NAMES
        ]
    )
